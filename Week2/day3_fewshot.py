import json
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY= os.getenv("GROQ_API_KEY")

client = OpenAI(api_key=GROQ_API_KEY,base_url="https://api.groq.com/openai/v1" )

with open("prompts.json", "r") as file:
    templates = json.load(file)

classifier_prompt = templates["ticket_classifier"] 

new_issue = "mera internet bar bar disconnect ho rha hai."

messages = [
    {"role": "system", "content": classifier_prompt["system"]}
]

messages.extend(classifier_prompt["few_shot_examples"])

# Finally, format and append the actual user's message
final_user_prompt = classifier_prompt["user_template"].format(user_issue=new_issue)
messages.append({"role": "user", "content": final_user_prompt})
    
print("Sending these messages to AI:\n", json.dumps(messages, indent=2))
    
# 5. Groq API Call
print("\n--- AI Response ---")
response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=messages,
        temperature=0.1, # Close to zero because we want a strict category, not creativity
        max_tokens=200
    )

print(response.choices[0].message.content)
