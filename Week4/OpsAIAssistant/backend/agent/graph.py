from typing import Annotated, TypedDict

from langchain_core.messages import BaseMessage, SystemMessage
from langchain_groq import ChatGroq
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode

from agent.prompts import OPS_AGENT_SYSTEM_PROMPT
from agent.tools import all_tools, safe_tools, sensitive_tools


class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]


llm = ChatGroq(model="openai/gpt-oss-20b", temperature=0)
llm_with_tools = llm.bind_tools(all_tools, parallel_tool_calls=False)


def chatbot_node(state: AgentState):
    messages = state["messages"]
    if not messages or not isinstance(messages[0], SystemMessage):
        messages = [SystemMessage(content=OPS_AGENT_SYSTEM_PROMPT), *messages]
    return {"messages": [llm_with_tools.invoke(messages)]}


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
