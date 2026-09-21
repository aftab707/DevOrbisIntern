import os
import tiktoken
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

# Insert your Groq API key here or set it in the .env file
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Groq supports the OpenAI standard, so we will use the standard OpenAI library
client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

# The text we will send to the API
user_message = "I am going to my village after a long time to meet my grandfather and ask his condition. Write an email to my boss asking for leaves. Email should contains 70 to 100 words and it should be professional and format must formall."

# ==========================================
# 1. COUNTING TOKENS WITH TIKTOKEN
# ==========================================
print("--- Token Counting ---")
# Note: tiktoken is OpenAI's tokenizer. Groq's (Llama 3) token count might be slightly different, 
# but tiktoken remains the industry standard for cost and size estimation.
encoding = tiktoken.get_encoding("cl100k_base") # Default encoding for modern models
tokens = encoding.encode(user_message)
token_count = len(tokens)

print(f"Total Words: {len(user_message.split())}")
print(f"Estimated Tokens: {token_count}\n")

# ==========================================
# 2. MAKING THE GROQ API CALL
# ==========================================
print("--- Groq API Response ---")
try:
    response = client.chat.completions.create(
        model="openai/gpt-oss-20b", # A supported model on Groq
        messages=[
            {"role": "system", "content": "You are a helpful and clear AI assistant."},
            {"role": "user", "content": user_message}
        ],
        temperature=0.5, # Balance between creativity and factualness
        max_tokens=1000
    )

    print(response.choices[0].message.content)
    
    # We can also view the actual token usage returned by Groq
    print("\n--- Actual Usage (from Groq) ---")
    print(f"Prompt Tokens: {response.usage.prompt_tokens}")
    print(f"Completion Tokens: {response.usage.completion_tokens}")
    print(f"Total Tokens: {response.usage.total_tokens}")

except Exception as e:
    print(f"Error: API call failed. Please check your API key. Detail: {e}")
