from typing import Annotated, TypedDict

from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage
from langchain_groq import ChatGroq
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode

from agent.prompts import OPS_AGENT_SYSTEM_PROMPT
from agent.tools import all_tools, safe_tools, sensitive_tools


class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    tool_choice: str


llm = ChatGroq(model="openai/gpt-oss-20b", temperature=0)
llm_with_tools = llm.bind_tools(all_tools, parallel_tool_calls=False)


def chatbot_node(state: AgentState):
    messages = list(state["messages"])
    choice = state.get("tool_choice", "auto")
    
    if choice and choice != "auto":
        # Consolidate email tools if selected from UI
        if choice == "email":
            allowed_tools = [t for t in all_tools if t.name in ["draft_email", "send_email"]]
        else:
            allowed_tools = [t for t in all_tools if t.name == choice]
            
        tool_names = [t.name for t in allowed_tools]
        
        dynamic_sys_prompt = (
            f"You are the Ops Assistant Agent. The user has STRICTLY restricted you to use ONLY the following tool(s): {', '.join(tool_names)}.\n\n"
            f"CRITICAL RULES:\n"
            f"1. DO NOT USE YOUR GENERAL KNOWLEDGE. You must act ONLY as an interface for the '{choice}' tool.\n"
            f"2. If the user asks for math, email drafting, or client data, and you DO NOT have the required tool for it, YOU MUST REFUSE. Do not calculate math in your head. Do not draft emails in plain text. Reply exactly: 'You have restricted me to the {choice} tool, which does not support this functionality. Please select the appropriate tool from the dropdown or switch to Auto-Select.'\n"
            f"3. If the query might be related to {choice}, call the tool. If the tool returns 'No results', DO NOT fill in the blanks from memory. Reply that the data was not found using the {choice} tool."
        )
        
        # To prevent Groq API 400 BadRequestErrors (caused by strict tool history validation)
        # and to prevent the agent from leaking history, we ONLY pass the current interaction turn.
        current_turn = []
        for msg in reversed(messages):
            if isinstance(msg, SystemMessage):
                continue
            current_turn.insert(0, msg)
            if isinstance(msg, HumanMessage):
                break
                
        messages = [SystemMessage(content=dynamic_sys_prompt)] + current_turn
            
        bound_llm = llm.bind_tools(allowed_tools, parallel_tool_calls=False)
    else:
        if not messages or not isinstance(messages[0], SystemMessage):
            messages = [SystemMessage(content=OPS_AGENT_SYSTEM_PROMPT)] + messages
        bound_llm = llm_with_tools
        
    return {"messages": [bound_llm.invoke(messages)], "tool_choice": "auto"}


def route_tools(state: AgentState):
    last_message = state["messages"][-1]
    tool_calls = getattr(last_message, "tool_calls", [])
    if not tool_calls:
        return END
    sensitive_names = {tool.name for tool in sensitive_tools}
    return "sensitive_tools_node" if any(call["name"] in sensitive_names for call in tool_calls) else "safe_tools_node"


graph_builder = StateGraph(AgentState)
graph_builder.add_node("chatbot", chatbot_node)
graph_builder.add_node("safe_tools_node", ToolNode(safe_tools, handle_tool_errors=True))
graph_builder.add_node("sensitive_tools_node", ToolNode(sensitive_tools, handle_tool_errors=True))
graph_builder.add_edge(START, "chatbot")
graph_builder.add_conditional_edges(
    "chatbot",
    route_tools,
    {"safe_tools_node": "safe_tools_node", "sensitive_tools_node": "sensitive_tools_node", END: END},
)
graph_builder.add_edge("safe_tools_node", "chatbot")
graph_builder.add_edge("sensitive_tools_node", "chatbot")

memory = MemorySaver()
agent_graph = graph_builder.compile(checkpointer=memory, interrupt_before=["sensitive_tools_node"])
