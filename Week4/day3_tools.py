import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.tools import tool

# Load environment variables
load_dotenv()


# 1. Define Tools using the @tool decorator

@tool
def multiply(a: int, b: int) -> int:
    """Useful for multiplying two integers together."""
    return a * b

@tool
def add(a: int, b: int) -> int:
    """Useful for adding two integers together."""
    return a + b

tools = [multiply, add]


# 2. Initialize LLM and Bind Tools

llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0)
llm_with_tools = llm.bind_tools(tools)


# 3. Test Tool Execution Request

if __name__ == "__main__":
    question = "What is 45 multiplied by 12?"
    
    print(f"Question: {question}\n")
    print("Agent is thinking...\n")
    
    response = llm_with_tools.invoke(question)
    
    print("--- RAW RESPONSE ---")
    print(response.content) 
    
    print("\n--- TOOL CALLS REQUESTED BY LLM ---")
    print(response.tool_calls)
