import asyncio
from tortoise import Tortoise
from models import User, UserRole
from auth import get_password_hash
import os

async def create_test_users():
    await Tortoise.init(
        db_url=os.getenv("DATABASE_URL", "sqlite://db.sqlite3").replace("postgresql://", "postgres://"),
        modules={"models": ["models"]}
    )
    
    test_users = [
        {"email": "customer@test.com", "password": "password", "first_name": "Bob", "last_name": "Customer", "role": UserRole.CUSTOMER},
        {"email": "agent@test.com", "password": "password", "first_name": "John", "last_name": "Agent", "role": UserRole.AGENT},
        {"email": "adjuster@test.com", "password": "password", "first_name": "Jane", "last_name": "Adjuster", "role": UserRole.ADJUSTER},
        {"email": "manager@test.com", "password": "password", "first_name": "Mike", "last_name": "Manager", "role": UserRole.MANAGER},
        {"email": "admin@test.com", "password": "password", "first_name": "Alice", "last_name": "Admin", "role": UserRole.ADMIN},
    ]
    
    for user_data in test_users:
        existing = await User.get_or_none(email=user_data["email"])
        if not existing:
            await User.create(
                email=user_data["email"],
                password_hash=get_password_hash(user_data["password"]),
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                role=user_data["role"]
            )
            print(f"Created {user_data['role']} user: {user_data['email']}")
        else:
            print(f"User already exists: {user_data['email']}")
    
    await Tortoise.close_connections()

if __name__ == "__main__":
    asyncio.run(create_test_users())