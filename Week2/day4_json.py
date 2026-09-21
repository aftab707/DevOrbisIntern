import os
import instructor
from openai import OpenAI
from pydantic import BaseModel, Field
from dotenv import load_dotenv
    
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    
    # 1. Instructor ko OpenAI client k upar wrap karte hain
    # Yeh client automatic retry aur Pydantic validation handle karega!
client = instructor.from_openai(
        OpenAI(api_key=GROQ_API_KEY, base_url="https://api.groq.com/openai/v1"),
        mode=instructor.Mode.JSON
    )
    
    # 2. Pydantic Schema Design (Security Guard 👮‍♂️)
    # Hum bata rahe hain k humein exactly kis form mein data chahiye
class CandidateInfo(BaseModel):
        name: str = Field(description="Full name of the candidate")
        age: int = Field(description="Age of the candidate as a number")
        is_hired: bool = Field(description="True if they have 5+ years experience, else False")
        skills: list[str] = Field(description="List of technical skills")
    
    # Ek messy input text jo user ne diya
messy_cv = """
    Meet Ahmed Khan. He is twenty-four years old. He has been coding for 6 years. 
    He knows Python, C++, and React. He loves playing cricket.
    """
    
print("Extracting JSON from CV...")
    
    # 3. API Call (With automatic retries!)
candidate = client.chat.completions.create(
        model="openai/gpt-oss-20b", 
        response_model=CandidateInfo, # Yahan humne AI ko apna Schema pass kar diya
        messages=[
            {"role": "system", "content": "You are a world-class data extraction algorithm."},
            {"role": "user", "content": f"Extract the information from this CV: {messy_cv}"}
        ],
        temperature=0.0, # Zero creativity, only facts!
        max_retries=2    # Agar AI ghalti kare, toh 2 dafa automatically dubara try karo!
    )
    
    # 4. Perfect Data Output
print("\n--- Pydantic Object ---")
print(f"Name: {candidate.name}")
print(f"Age: {candidate.age} (Dekho AI ne 'twenty-four' ko 24 number mein badal diya!)")
print(f"Hired: {candidate.is_hired}")
print(f"Skills: {candidate.skills}")

print("\n--- Raw JSON ---")
print(candidate.model_dump_json(indent=2))
