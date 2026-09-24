import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=groq_api_key)

def generate_rag_response(query: str, context: str) -> str:
    """
    Generates a grounded response using the Groq API.
    Enforces strict hallucination control via system prompting.
    """
    system_prompt = f"""You are a highly intelligent, professional enterprise AI assistant.
Your task is to answer the user's question using ONLY the provided context below.

CRITICAL INSTRUCTIONS:
1. If the answer is not explicitly contained within the context, you must state exactly: "I cannot find the answer in the provided documents."
2. Do not hallucinate, guess, or use your general knowledge.
3. Keep your answers clear, professional, and well-structured.

CONTEXT:
{context}
"""

    response = groq_client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query}
        ],
        model="openai/gpt-oss-20b",
        temperature=0.2, # Low temperature for analytical consistency
    )
    
    return response.choices[0].message.content
