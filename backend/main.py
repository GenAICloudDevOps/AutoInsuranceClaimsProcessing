from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from tortoise.contrib.fastapi import register_tortoise
from datetime import timedelta
import os
import uuid
from typing import List

from models import User, Policy, Claim, ClaimDocument, ClaimNote, UserRole, ClaimStatus
from schemas import *
from auth import *

app = FastAPI(title="Auto Insurance Claims API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.post("/auth/register", response_model=UserResponse)
async def register(user: UserCreate):
    existing_user = await User.get_or_none(email=user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = await User.create(
        email=user.email,
        password_hash=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role
    )
    return UserResponse.model_validate(new_user.__dict__)

@app.post("/auth/login", response_model=Token)
async def login(email: str = Form(), password: str = Form()):
    user = await User.get_or_none(email=email)
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user.__dict__)

@app.post("/policies")
async def create_default_policy(
    current_user: User = Depends(require_role([UserRole.CUSTOMER, UserRole.AGENT]))
):
    # Check if user already has a policy
    existing_policy = await Policy.get_or_none(customer_id=current_user.id)
    if existing_policy:
        return {"message": "Policy already exists", "policy_id": existing_policy.id}
    
    # Create a default policy for the user
    import uuid
    policy_number = f"POL-{uuid.uuid4().hex[:8].upper()}"
    new_policy = await Policy.create(
        policy_number=policy_number,
        customer_id=current_user.id,
        vehicle_make="Toyota",
        vehicle_model="Camry",
        vehicle_year=2020,
        license_plate="ABC123",
        coverage_amount=50000.00
    )
    return {"message": "Policy created", "policy_id": new_policy.id}

@app.get("/policies")
async def get_user_policies(current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.CUSTOMER:
        policies = await Policy.filter(customer_id=current_user.id)
    else:
        policies = await Policy.all()
    
    return [{"id": p.id, "policy_number": p.policy_number, "vehicle_make": p.vehicle_make, "vehicle_model": p.vehicle_model} for p in policies]

@app.post("/claims", response_model=ClaimResponse)
async def create_claim(
    claim: ClaimCreate,
    current_user: User = Depends(require_role([UserRole.CUSTOMER, UserRole.AGENT]))
):
    policy = await Policy.get_or_none(id=claim.policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    claim_number = f"CLM-{uuid.uuid4().hex[:8].upper()}"
    new_claim = await Claim.create(
        claim_number=claim_number,
        policy_id=claim.policy_id,
        customer_id=policy.customer_id,
        incident_date=claim.incident_date,
        incident_description=claim.incident_description,
        incident_location=claim.incident_location
    )
    return ClaimResponse.model_validate(new_claim.__dict__)

@app.get("/claims", response_model=List[ClaimResponse])
async def get_claims(current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.CUSTOMER:
        # Customers see only their own claims
        claims = await Claim.filter(customer_id=current_user.id)
    elif current_user.role == UserRole.AGENT:
        # Agents see submitted and under_review claims
        claims = await Claim.filter(status__in=[ClaimStatus.SUBMITTED, ClaimStatus.UNDER_REVIEW])
    elif current_user.role == UserRole.ADJUSTER:
        # Adjusters see assigned and investigating claims assigned to them + all unassigned
        claims = await Claim.filter(
            status__in=[ClaimStatus.ASSIGNED, ClaimStatus.INVESTIGATING, ClaimStatus.APPROVED]
        ).filter(
            assigned_adjuster_id__in=[current_user.id, None]
        )
    elif current_user.role == UserRole.MANAGER:
        # Managers see claims that need assignment or are in progress
        claims = await Claim.filter(
            status__in=[ClaimStatus.UNDER_REVIEW, ClaimStatus.ASSIGNED, ClaimStatus.INVESTIGATING, ClaimStatus.APPROVED]
        )
    else:  # ADMIN
        # Admins see all claims
        claims = await Claim.all()
    
    return [ClaimResponse.model_validate(claim.__dict__) for claim in claims]

@app.get("/claims/{claim_id}", response_model=ClaimResponse)
async def get_claim_detail(
    claim_id: int,
    current_user: User = Depends(get_current_user)
):
    claim = await Claim.get_or_none(id=claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    # Check access permissions
    if current_user.role == UserRole.CUSTOMER and claim.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role == UserRole.ADJUSTER and claim.assigned_adjuster_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return ClaimResponse.model_validate(claim.__dict__)

@app.put("/claims/{claim_id}/status")
async def update_claim_status(
    claim_id: int,
    new_status: ClaimStatus,
    estimated_damage: Optional[float] = None,
    approved_amount: Optional[float] = None,
    assigned_adjuster_id: Optional[int] = None,
    current_user: User = Depends(get_current_user)
):
    claim = await Claim.get_or_none(id=claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    # Workflow validation
    if not can_transition_status(claim.status, new_status, current_user.role):
        raise HTTPException(status_code=403, detail=f"Cannot transition from {claim.status} to {new_status} with role {current_user.role}")
    
    # Update claim
    claim.status = new_status
    if estimated_damage is not None:
        claim.estimated_damage = estimated_damage
    if approved_amount is not None:
        claim.approved_amount = approved_amount
    if assigned_adjuster_id is not None:
        claim.assigned_adjuster_id = assigned_adjuster_id
    
    await claim.save()
    return {"message": "Status updated successfully"}

def can_transition_status(current_status: ClaimStatus, new_status: ClaimStatus, user_role: UserRole) -> bool:
    """Validate workflow transitions based on user role"""
    transitions = {
        ClaimStatus.SUBMITTED: {
            UserRole.AGENT: [ClaimStatus.UNDER_REVIEW, ClaimStatus.REJECTED],
            UserRole.MANAGER: [ClaimStatus.UNDER_REVIEW, ClaimStatus.ASSIGNED],
            UserRole.ADMIN: [ClaimStatus.UNDER_REVIEW, ClaimStatus.ASSIGNED, ClaimStatus.REJECTED]
        },
        ClaimStatus.UNDER_REVIEW: {
            UserRole.AGENT: [ClaimStatus.REJECTED],
            UserRole.MANAGER: [ClaimStatus.ASSIGNED, ClaimStatus.REJECTED],
            UserRole.ADMIN: [ClaimStatus.ASSIGNED, ClaimStatus.REJECTED]
        },
        ClaimStatus.ASSIGNED: {
            UserRole.ADJUSTER: [ClaimStatus.INVESTIGATING, ClaimStatus.REJECTED],
            UserRole.MANAGER: [ClaimStatus.INVESTIGATING, ClaimStatus.REJECTED],
            UserRole.ADMIN: [ClaimStatus.INVESTIGATING, ClaimStatus.APPROVED, ClaimStatus.REJECTED]
        },
        ClaimStatus.INVESTIGATING: {
            UserRole.ADJUSTER: [ClaimStatus.APPROVED, ClaimStatus.REJECTED],
            UserRole.MANAGER: [ClaimStatus.APPROVED, ClaimStatus.REJECTED],
            UserRole.ADMIN: [ClaimStatus.APPROVED, ClaimStatus.REJECTED, ClaimStatus.SETTLED]
        },
        ClaimStatus.APPROVED: {
            UserRole.ADMIN: [ClaimStatus.SETTLED],
            UserRole.MANAGER: [ClaimStatus.SETTLED]
        },
        ClaimStatus.REJECTED: {},
        ClaimStatus.SETTLED: {}
    }
    
    allowed_transitions = transitions.get(current_status, {})
    return new_status in allowed_transitions.get(user_role, [])

@app.get("/users/adjusters")
async def get_adjusters(
    current_user: User = Depends(require_role([UserRole.MANAGER, UserRole.ADMIN]))
):
    adjusters = await User.filter(role=UserRole.ADJUSTER, is_active=True)
    return [{"id": u.id, "name": f"{u.first_name} {u.last_name}"} for u in adjusters]

@app.post("/claims/{claim_id}/documents")
async def upload_document(
    claim_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    claim = await Claim.get_or_none(id=claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    file_extension = file.filename.split('.')[-1]
    file_name = f"{uuid.uuid4().hex}.{file_extension}"
    file_path = f"uploads/{file_name}"
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    document = await ClaimDocument.create(
        claim_id=claim_id,
        file_name=file.filename,
        file_path=file_path,
        file_type=file.content_type,
        uploaded_by_id=current_user.id
    )
    return {"message": "Document uploaded successfully", "document_id": document.id}

@app.post("/claims/{claim_id}/notes", response_model=ClaimNoteResponse)
async def add_note(
    claim_id: int,
    note: ClaimNoteCreate,
    current_user: User = Depends(get_current_user)
):
    claim = await Claim.get_or_none(id=claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    new_note = await ClaimNote.create(
        claim_id=claim_id,
        author_id=current_user.id,
        content=note.content
    )
    return ClaimNoteResponse(
        id=new_note.id,
        content=new_note.content,
        author_name=f"{current_user.first_name} {current_user.last_name}",
        created_at=new_note.created_at
    )

register_tortoise(
    app,
    db_url=os.getenv("DATABASE_URL", "sqlite://db.sqlite3").replace("postgresql://", "postgres://"),
    modules={"models": ["models"]},
    generate_schemas=True,
    add_exception_handlers=True,
)