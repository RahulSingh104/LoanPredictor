"""
Seed MongoDB with default users and check dataset availability.
Run: python utils/seed_data.py
"""

import os
from pathlib import Path
from werkzeug.security import generate_password_hash
from app import mongo, app

def seed_users():
    """Insert a default admin and test user into MongoDB."""
    with app.app_context():
        users = [
            {
                "username": "Admin",
                "email": "admin@example.com",
                "password": generate_password_hash("admin123"),
                "role": "admin"
            },
            {
                "username": "Test User",
                "email": "user@example.com",
                "password": generate_password_hash("user123"),
                "role": "user"
            }
        ]

        for u in users:
            existing = mongo.db.users.find_one({"email": u["email"]})
            if not existing:
                mongo.db.users.insert_one(u)
                print(f"✅ Inserted: {u['email']}")
            else:
                print(f"⚠️ Already exists: {u['email']}")

def check_dataset():
    """Ensure loan dataset exists in /data."""
    dataset_path = Path(__file__).resolve().parent.parent / "data" / "loan_approval_dataset.csv"
    if dataset_path.exists():
        print(f"✅ Dataset found at: {dataset_path}")
    else:
        print(f"⚠️ Dataset missing: {dataset_path}")

if __name__ == "__main__":
    seed_users()
    check_dataset()
    print("🎉 Seeding complete!")
