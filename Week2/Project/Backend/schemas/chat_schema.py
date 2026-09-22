from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str = Field(..., description="The role of the message sender (e.g., 'user', 'assistant')")
    content: str = Field(..., description="The actual message text")

class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(..., description="List of conversation history")
