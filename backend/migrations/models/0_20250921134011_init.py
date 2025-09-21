from tortoise import BaseDBAsyncClient


async def upgrade(db: BaseDBAsyncClient) -> str:
    return """
        CREATE TABLE IF NOT EXISTS "user" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "email" VARCHAR(100) NOT NULL UNIQUE,
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "role" VARCHAR(8) NOT NULL,
    "is_active" BOOL NOT NULL  DEFAULT True,
    "created_at" TIMESTAMPTZ NOT NULL  DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON COLUMN "user"."role" IS 'CUSTOMER: customer\nAGENT: agent\nADJUSTER: adjuster\nMANAGER: manager\nADMIN: admin';
CREATE TABLE IF NOT EXISTS "policy" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "policy_number" VARCHAR(50) NOT NULL UNIQUE,
    "vehicle_make" VARCHAR(50) NOT NULL,
    "vehicle_model" VARCHAR(50) NOT NULL,
    "vehicle_year" INT NOT NULL,
    "license_plate" VARCHAR(20) NOT NULL,
    "coverage_amount" DECIMAL(10,2) NOT NULL,
    "is_active" BOOL NOT NULL  DEFAULT True,
    "created_at" TIMESTAMPTZ NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    "customer_id" INT NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "claim" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "claim_number" VARCHAR(50) NOT NULL UNIQUE,
    "status" VARCHAR(13) NOT NULL  DEFAULT 'submitted',
    "incident_date" TIMESTAMPTZ NOT NULL,
    "incident_description" TEXT NOT NULL,
    "incident_location" VARCHAR(255) NOT NULL,
    "estimated_damage" DECIMAL(10,2),
    "approved_amount" DECIMAL(10,2),
    "created_at" TIMESTAMPTZ NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    "assigned_adjuster_id" INT REFERENCES "user" ("id") ON DELETE CASCADE,
    "customer_id" INT NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
    "policy_id" INT NOT NULL REFERENCES "policy" ("id") ON DELETE CASCADE
);
COMMENT ON COLUMN "claim"."status" IS 'SUBMITTED: submitted\nUNDER_REVIEW: under_review\nASSIGNED: assigned\nINVESTIGATING: investigating\nAPPROVED: approved\nREJECTED: rejected\nSETTLED: settled';
CREATE TABLE IF NOT EXISTS "claimdocument" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "file_name" VARCHAR(255) NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "file_type" VARCHAR(50) NOT NULL,
    "uploaded_at" TIMESTAMPTZ NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    "claim_id" INT NOT NULL REFERENCES "claim" ("id") ON DELETE CASCADE,
    "uploaded_by_id" INT NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "claimnote" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    "author_id" INT NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
    "claim_id" INT NOT NULL REFERENCES "claim" ("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS "aerich" (
    "id" SERIAL NOT NULL PRIMARY KEY,
    "version" VARCHAR(255) NOT NULL,
    "app" VARCHAR(100) NOT NULL,
    "content" JSONB NOT NULL
);"""


async def downgrade(db: BaseDBAsyncClient) -> str:
    return """
        """
