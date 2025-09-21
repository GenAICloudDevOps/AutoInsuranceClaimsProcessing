from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import UserRole, ClaimStatus

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    role: UserRole

class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    role: UserRole
    is_active: bool
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class ClaimCreate(BaseModel):
    policy_id: int
    incident_date: datetime
    incident_description: str
    incident_location: str

class ClaimUpdate(BaseModel):
    status: Optional[ClaimStatus] = None
    assigned_adjuster_id: Optional[int] = None
    estimated_damage: Optional[float] = None
    approved_amount: Optional[float] = None

class ClaimResponse(BaseModel):
    id: int
    claim_number: str
    status: ClaimStatus
    incident_date: datetime
    incident_description: str
    incident_location: str
    estimated_damage: Optional[float]
    approved_amount: Optional[float]
    created_at: datetime
    updated_at: datetime

class PolicyResponse(BaseModel):
    id: int
    policy_number: str
    vehicle_make: str
    vehicle_model: str
    vehicle_year: int
    license_plate: str
    coverage_amount: float

class ClaimNoteCreate(BaseModel):
    content: str

class ClaimNoteResponse(BaseModel):
    id: int
    content: str
    author_name: str
    created_at: datetime