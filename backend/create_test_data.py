import asyncio
from tortoise import Tortoise
from models import User, Policy, Claim, UserRole, ClaimStatus
from datetime import datetime, timedelta
import os
import uuid

async def create_test_data():
    await Tortoise.init(
        db_url=os.getenv("DATABASE_URL", "sqlite://db.sqlite3").replace("postgresql://", "postgres://"),
        modules={"models": ["models"]}
    )
    
    # Get test users
    customer = await User.get(email="customer@test.com")
    adjuster = await User.get(email="adjuster@test.com")
    
    # Create a policy for the customer if not exists
    policy = await Policy.get_or_none(customer_id=customer.id)
    if not policy:
        policy = await Policy.create(
            policy_number=f"POL-{uuid.uuid4().hex[:8].upper()}",
            customer_id=customer.id,
            vehicle_make="Honda",
            vehicle_model="Civic",
            vehicle_year=2021,
            license_plate="TEST123",
            coverage_amount=75000.00
        )
    
    # Test claims data with various stages
    test_claims = [
        {
            "incident_description": "Rear-ended at traffic light",
            "incident_location": "Main St & 5th Ave",
            "status": ClaimStatus.SUBMITTED,
            "estimated_damage": None,
            "approved_amount": None,
            "assigned_adjuster_id": None
        },
        {
            "incident_description": "Side collision in parking lot",
            "incident_location": "Walmart Parking Lot",
            "status": ClaimStatus.UNDER_REVIEW,
            "estimated_damage": None,
            "approved_amount": None,
            "assigned_adjuster_id": None
        },
        {
            "incident_description": "Hit by falling tree branch",
            "incident_location": "Oak Street",
            "status": ClaimStatus.ASSIGNED,
            "estimated_damage": None,
            "approved_amount": None,
            "assigned_adjuster_id": adjuster.id
        },
        {
            "incident_description": "Vandalism - keyed car",
            "incident_location": "Home driveway",
            "status": ClaimStatus.INVESTIGATING,
            "estimated_damage": 2500.00,
            "approved_amount": None,
            "assigned_adjuster_id": adjuster.id
        },
        {
            "incident_description": "Hail damage to roof and hood",
            "incident_location": "Highway 101",
            "status": ClaimStatus.APPROVED,
            "estimated_damage": 4500.00,
            "approved_amount": 4200.00,
            "assigned_adjuster_id": adjuster.id
        },
        {
            "incident_description": "Fender bender in drive-thru",
            "incident_location": "McDonald's Drive-thru",
            "status": ClaimStatus.SETTLED,
            "estimated_damage": 1800.00,
            "approved_amount": 1650.00,
            "assigned_adjuster_id": adjuster.id
        },
        {
            "incident_description": "Hit and run in mall parking",
            "incident_location": "Shopping Mall Lot B",
            "status": ClaimStatus.REJECTED,
            "estimated_damage": None,
            "approved_amount": None,
            "assigned_adjuster_id": adjuster.id
        },
        {
            "incident_description": "Collision with deer",
            "incident_location": "Rural Route 45",
            "status": ClaimStatus.SUBMITTED,
            "estimated_damage": None,
            "approved_amount": None,
            "assigned_adjuster_id": None
        },
        {
            "incident_description": "Flood damage from storm",
            "incident_location": "Downtown area",
            "status": ClaimStatus.INVESTIGATING,
            "estimated_damage": 8500.00,
            "approved_amount": None,
            "assigned_adjuster_id": adjuster.id
        },
        {
            "incident_description": "Theft of vehicle parts",
            "incident_location": "Apartment complex",
            "status": ClaimStatus.APPROVED,
            "estimated_damage": 3200.00,
            "approved_amount": 2800.00,
            "assigned_adjuster_id": adjuster.id
        }
    ]
    
    # Create claims
    for i, claim_data in enumerate(test_claims):
        existing_claim = await Claim.get_or_none(claim_number=f"CLM-TEST{i+1:02d}")
        if not existing_claim:
            incident_date = datetime.now() - timedelta(days=i*2)  # Spread claims over time
            
            await Claim.create(
                claim_number=f"CLM-TEST{i+1:02d}",
                policy_id=policy.id,
                customer_id=customer.id,
                incident_date=incident_date,
                incident_description=claim_data["incident_description"],
                incident_location=claim_data["incident_location"],
                status=claim_data["status"],
                estimated_damage=claim_data["estimated_damage"],
                approved_amount=claim_data["approved_amount"],
                assigned_adjuster_id=claim_data["assigned_adjuster_id"]
            )
            print(f"Created claim CLM-TEST{i+1:02d} with status {claim_data['status']}")
        else:
            print(f"Claim CLM-TEST{i+1:02d} already exists")
    
    await Tortoise.close_connections()
    print("\nTest data creation completed!")
    print("\nClaim distribution by status:")
    print("- SUBMITTED: 2 claims")
    print("- UNDER_REVIEW: 1 claim") 
    print("- ASSIGNED: 1 claim")
    print("- INVESTIGATING: 2 claims")
    print("- APPROVED: 2 claims")
    print("- SETTLED: 1 claim")
    print("- REJECTED: 1 claim")

if __name__ == "__main__":
    asyncio.run(create_test_data())