import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory

# Load environment variables
load_dotenv()

# 1. Initialize the LLM
llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0.7)

# 2. Create the Prompt Template with a placeholder for chat history
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a friendly AI assistant. Answer in 1-2 short sentences."),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{question}")
])

# 3. Build the basic LCEL chain
chain = prompt | llm

# 4. Setup the Memory Store for session management
store = {}

def get_session_history(session_id: str):
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]

# 5. Wrap the chain with conversation history logic
conversational_chain = RunnableWithMessageHistory(
    chain,
    get_session_history,
    input_messages_key="question",       
    history_messages_key="chat_history", 
)

# 6. Run the conversational loop
if __name__ == "__main__":
    session_id = "user_123" 
    
    print("🤖 Chat with AI! (Type 'exit' to stop)\n")
    
    while True:
        user_input = input("You: ")
        if user_input.lower() == 'exit':
            break
            
        response = conversational_chain.invoke(
            {"question": user_input},
            config={"configurable": {"session_id": session_id}}
        )
        
        print(f"AI: {response.content}\n")
