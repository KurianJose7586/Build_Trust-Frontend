from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

class LeadCreate(BaseModel):
    title: str = Field(..., min_length=3)
    category: str
    location: str
    budget: str
    desc: str

class JobCreate(BaseModel):
    workerName: str
    description: str
    address: str
    hours: int = Field(..., gt=0)
    totalCost: float = Field(..., gt=0)
    date: str

class ChatMessageCreate(BaseModel):
    workerId: str
    text: str

class OtpRequest(BaseModel):
    email: EmailStr

class OtpVerify(BaseModel):
    email: EmailStr
    code: str

class CheckEmailRequest(BaseModel):
    email: EmailStr

class LoginPasswordRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: str # 'customer' or 'specialist'
    fullName: str
    specialty: Optional[str] = None
    rate: Optional[int] = None
