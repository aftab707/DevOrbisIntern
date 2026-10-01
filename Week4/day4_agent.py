import os
from dotenv import load_dotenv
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_groq import ChatGroq
from langchain_core.tools import tool

# Load environment variables
load_dotenv()


# 1. Define Tools

@tool
def multiply(a: int, b: int) -> int:
    """Useful for multiplying two integers together."""
    return a * b

@tool
def add(a: int, b: int) -> int:
    """Useful for adding two integers together."""
    return a + b

tools = [multiply, add]

# Initialize LLM and bind tools
llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0)
llm_with_tools = llm.bind_tools(tools)


# 2. Define the Graph State

class AgentState(TypedDict):
    # add_messages appends new messages to the existing list
    messages: Annotated[list, add_messages]


# 3. Define Graph Nodes

def chatbot_node(state: AgentState):
    print(" Agent is evaluating context...")
    response = llm_with_tools.invoke(state["messages"])
    return {"messages": [response]}

# ToolNode automatically executes the requested tool
tool_node = ToolNode(tools=tools)


# 4. Build the StateGraph

graph_builder = StateGraph(AgentState)

# Add nodes
graph_builder.add_node("chatbot", chatbot_node)
graph_builder.add_node("tools", tool_node)

# Define the control flow (edges)
graph_builder.add_edge(START, "chatbot")

# Conditional routing: routes to tools if LLM requests it, else ends
graph_builder.add_conditional_edges("chatbot", tools_condition)
graph_builder.add_edge("tools", "chatbot")

# Compile the graph
agent_executor = graph_builder.compile()


# 5. Run the Autonomous Agent

if __name__ == "__main__":
    question = "First add 15 and 25, then multiply the result by 3."
    
    print(f"User: {question}\n")
    initial_state = {"messages": [("user", question)]}
    
    # Stream the execution events
    for event in agent_executor.stream(initial_state):
        for node_name, state_update in event.items():
            print(f"--> Flow reached node: '{node_name}'")
            
            latest_msg = state_update["messages"][-1]
            if hasattr(latest_msg, 'tool_calls') and latest_msg.tool_calls:
                print(f"    Agent requested tools: {latest_msg.tool_calls}")
            elif hasattr(latest_msg, 'content') and latest_msg.content:
                print(f"    Agent output: {latest_msg.content}")
            print("-" * 40)
