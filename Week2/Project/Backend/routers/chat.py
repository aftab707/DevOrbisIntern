import json
import os
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from schemas.chat_schema import ChatRequest
from services.groq_service import standard_client

router = APIRouter()

# Dynamically load the prompts.json file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROMPTS_FILE = os.path.join(BASE_DIR, "prompts.json")

with open(PROMPTS_FILE, "r") as f:
    prompts = json.load(f)

chat_prompt = prompts["chat"]

@router.post("/chat")
async def chat_stream(request: ChatRequest):
    """
    Handles chat messages and streams the AI's response word-by-word.
    Loads its system prompt securely from an external JSON template.
    """
    # Use System prompt from JSON file
    system_message = {
        "role": "system", 
        "content": chat_prompt["system_prompt"]
    }
    
    api_messages = [system_message]
    for msg in request.messages:
        api_messages.append({"role": msg.role, "content": msg.content})

    def generate_chat():
        try:
            response = standard_client.chat.completions.create(
                model="openai/gpt-oss-20b",
                messages=api_messages,
                temperature=0.7, 
                stream=True      
            )
            
            for chunk in response:
                content = chunk.choices[0].delta.content
                if content is not None:
                    yield content
                    
        except Exception as e:
            yield f"Error generating response: {str(e)}"

    return StreamingResponse(generate_chat(), media_type="text/event-stream")
