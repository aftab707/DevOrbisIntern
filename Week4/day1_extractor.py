import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field

# Load environment variables
load_dotenv()

# 1. Define the desired output structure using Pydantic
class PersonInfo(BaseModel):
    name: str = Field(description="Person's full name")
    age: int = Field(description="Person's age in numbers")
    profession: str = Field(description="Person's current job or profession")

# 2. Initialize the JSON Output Parser
parser = JsonOutputParser(pydantic_object=PersonInfo)

# 3. Create the Prompt Template
prompt = PromptTemplate(
    template="Extract the given information from the user's text.\n{format_instructions}\n\nText: {text}",
    input_variables=["text"],
    partial_variables={"format_instructions": parser.get_format_instructions()},
)

# 4. Initialize the Groq LLM
llm = ChatGroq(
    model="llama-3.1-8b-instant", 
    temperature=0
)

# 5. Build the LCEL Chain (Prompt -> LLM -> Parser)
chain = prompt | llm | parser

# 6. Execute the chain
if __name__ == "__main__":
    sample_text = "Hi, my name is Ali Khan. I turned 28 last month and I currently work as a Data Scientist at a tech firm."
    
    print("Extracting data via LangChain & Groq...\n")
    result = chain.invoke({"text": sample_text})
    
    print("Output Type:", type(result))
    print("Parsed Result:", result)
