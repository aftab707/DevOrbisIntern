import os
import tiktoken
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

# Apna Groq API key yahan dalein ya .env file mein set krein
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Groq OpenAI k standard ko support krta hai, is liye hum OpenAI library hi use krein ge
client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

# Text jo hum API ko bhejein ge
user_message = "What is the difference between a Token and a Context Window in LLMs? Explain in 2 simple lines."

# ==========================================
# 1. TIKTOKEN SE TOKEN COUNTING KRNA
# ==========================================
print("--- Token Counting ---")
# Note: tiktoken OpenAI ka tokenizer hai. Groq (Llama 3) ka token count thora sa different ho skta hai, 
# lekin tiktoken cost aur size estimation k liye industry standard hai.
encoding = tiktoken.get_encoding("cl100k_base") # Modern models k liye default encoding
tokens = encoding.encode(user_message)
token_count = len(tokens)

print(f"Total Words: {len(user_message.split())}")
print(f"Estimated Tokens: {token_count}\n")

# ==========================================
# 2. GROQ API CALL KRNA
# ==========================================
print("--- Groq API Response ---")
try:
    response = client.chat.completions.create(
        model="openai/gpt-oss-20b", # Groq ka supported model
        messages=[
            {"role": "system", "content": "You are a helpful and clear AI assistant."},
            {"role": "user", "content": user_message}
        ],
        temperature=0.5, # Creativity aur factualness k darmiyan balance
        max_tokens=300
    )

    print(response.choices[0].message.content)
    
    # Hum Groq ki taraf se return kiye gye actual token usage bhi dekh skte hain
    print("\n--- Actual Usage (from Groq) ---")
    print(f"Prompt Tokens: {response.usage.prompt_tokens}")
    print(f"Completion Tokens: {response.usage.completion_tokens}")
    print(f"Total Tokens: {response.usage.total_tokens}")

except Exception as e:
    print(f"Error: API call fail ho gyi. PLease check your API key. Detail: {e}")
