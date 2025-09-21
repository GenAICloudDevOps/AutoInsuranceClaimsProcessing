from tortoise.models import Model
from tortoise import fields
from enum import Enum

class UserRole(str, Enum):
    CUSTOMER = "customer"
    AGENT = "agent"
    ADJUSTER = "adjuster"
    MANAGER = "manager"
    ADMIN = "admin"

class ClaimStatus(str, Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    ASSIGNED = "assigned"
    INVESTIGATING = "investigating"
    APPROVED = "approved"
    REJECTED = "rejected"
    SETTLED = "settled"

class User(Model):
    id = fields.IntField(pk=True)
    email = fields.CharField(max_length=100, unique=True)
    password_hash = fields.CharField(max_length=255)
    first_name = fields.CharField(max_length=50)
    last_name = fields.CharField(max_length=50)
    role = fields.CharEnumField(UserRole)
    is_active = fields.BooleanField(default=True)
    created_at = fields.DatetimeField(auto_now_add=True)

class Policy(Model):
    id = fields.IntField(pk=True)
    policy_number = fields.CharField(max_length=50, unique=True)
    customer = fields.ForeignKeyField("models.User", related_name="policies")
    vehicle_make = fields.CharField(max_length=50)
    vehicle_model = fields.CharField(max_length=50)
    vehicle_year = fields.IntField()
    license_plate = fields.CharField(max_length=20)
    coverage_amount = fields.DecimalField(max_digits=10, decimal_places=2)
    is_active = fields.BooleanField(default=True)
    created_at = fields.DatetimeField(auto_now_add=True)

class Claim(Model):
    id = fields.IntField(pk=True)
    claim_number = fields.CharField(max_length=50, unique=True)
    policy = fields.ForeignKeyField("models.Policy", related_name="claims")
    customer = fields.ForeignKeyField("models.User", related_name="customer_claims")
    assigned_adjuster = fields.ForeignKeyField("models.User", related_name="adjuster_claims", null=True)
    status = fields.CharEnumField(ClaimStatus, default=ClaimStatus.SUBMITTED)
    incident_date = fields.DatetimeField()
    incident_description = fields.TextField()
    incident_location = fields.CharField(max_length=255)
    estimated_damage = fields.DecimalField(max_digits=10, decimal_places=2, null=True)
    approved_amount = fields.DecimalField(max_digits=10, decimal_places=2, null=True)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

class ClaimDocument(Model):
    id = fields.IntField(pk=True)
    claim = fields.ForeignKeyField("models.Claim", related_name="documents")
    file_name = fields.CharField(max_length=255)
    file_path = fields.CharField(max_length=500)
    file_type = fields.CharField(max_length=50)
    uploaded_by = fields.ForeignKeyField("models.User", related_name="uploaded_documents")
    uploaded_at = fields.DatetimeField(auto_now_add=True)

class ClaimNote(Model):
    id = fields.IntField(pk=True)
    claim = fields.ForeignKeyField("models.Claim", related_name="notes")
    author = fields.ForeignKeyField("models.User", related_name="authored_notes")
    content = fields.TextField()
    created_at = fields.DatetimeField(auto_now_add=True)