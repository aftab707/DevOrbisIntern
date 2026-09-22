from pydantic import BaseModel, Field

class ExtractRequest(BaseModel):
    raw_text: str = Field(..., description="The messy text to extract data from.")

class ExtractedCVData(BaseModel):
    full_name: str = Field(default="Not Found", description="Full name of the person")
    email: str = Field(default="Not Found", description="Email address")
    years_of_experience: int = Field(default=0, description="Total years of professional experience as an integer")
    key_skills: list[str] = Field(default=[], description="List of technical or professional skills mentioned")
    summary: str = Field(..., description="A short, 2-sentence professional summary of the candidate")

class TokenUsage(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int

class ExtractResponse(BaseModel):
    success: bool
    data: ExtractedCVData | None = None
    usage: TokenUsage | None = None
    error: str | None = None
