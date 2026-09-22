import os
import instructor
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("CRITICAL: GROQ_API_KEY is missing from environment variables or .env file.")

# 1. Standard Client (Used for Streaming Chat)
standard_client = OpenAI(
    api_key=GROQ_API_KEY, 
    base_url="https://api.groq.com/openai/v1"
)

# 2. Instructor Wrapped Client (Used for Strict JSON Extraction)
instructor_client = instructor.from_openai(
    OpenAI(api_key=GROQ_API_KEY, base_url="https://api.groq.com/openai/v1"),
    mode=instructor.Mode.JSON
)
