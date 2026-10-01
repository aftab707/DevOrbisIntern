from pydantic import BaseModel, Field
from typing import List, Optional

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default_session"

class ChatResponse(BaseModel):
    response: str
    needs_approval: bool = False
    pending_tool_call: Optional[dict] = None

class ApprovalRequest(BaseModel):
    session_id: str
    approved: bool
    feedback: Optional[str] = None
