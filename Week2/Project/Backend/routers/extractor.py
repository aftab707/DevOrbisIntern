import json
import os
from fastapi import APIRouter
from schemas.extractor_schema import ExtractRequest, ExtractedCVData, TokenUsage, ExtractResponse
from services.groq_service import instructor_client

router = APIRouter()

# Dynamically load the prompts.json file (which is in the parent directory of routers)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROMPTS_FILE = os.path.join(BASE_DIR, "prompts.json")

with open(PROMPTS_FILE, "r") as f:
    prompts = json.load(f)

extractor_prompt = prompts["extractor"]

@router.post("/extract", response_model=ExtractResponse)
def extract_information(request: ExtractRequest):
    """
    Takes raw text, sends it to Groq AI via Instructor (using Few-Shot templates), 
    and returns strictly validated JSON data.
    """
    try:
        # 1. Start with the System Prompt from JSON
        messages = [{"role": "system", "content": extractor_prompt["system_prompt"]}]
        
        # 2. Append Few-Shot Examples from JSON
        messages.extend(extractor_prompt["few_shot_examples"])
        
        # 3. Finally, add the actual user request
        messages.append({
            "role": "user", 
            "content": f"Extract data from this text:\n\n{request.raw_text}"
        })

        extracted_data, raw_response = instructor_client.chat.completions.create_with_completion(
            model="llama3-8b-8192", 
            response_model=ExtractedCVData,
            messages=messages,
            temperature=0.0,
            max_retries=2
        )

        usage = TokenUsage(
            prompt_tokens=raw_response.usage.prompt_tokens,
            completion_tokens=raw_response.usage.completion_tokens,
            total_tokens=raw_response.usage.total_tokens
        )

        return ExtractResponse(success=True, data=extracted_data, usage=usage)

    except Exception as e:
        print(f"Extraction Error: {e}")
        return ExtractResponse(success=False, error=str(e))
