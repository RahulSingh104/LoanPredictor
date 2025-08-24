from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId

# Initialize here, actual binding done in app.py
mongo = PyMongo()

class User:
    @staticmethod
    def create_user(username, email, password):
        """Create a new user with hashed password. Returns inserted_id (str)."""
        existing_user = mongo.db.users.find_one({"email": email})
        if existing_user:
            raise ValueError("User already exists")

        hashed_pw = generate_password_hash(password)
        result = mongo.db.users.insert_one({
            "username": username,
            "email": email,
            "password": hashed_pw
        })
        return str(result.inserted_id)

    @staticmethod
    def find_by_email(email):
        """Find a user by email. Returns dict or None."""
        return mongo.db.users.find_one({"email": email})

    @staticmethod
    def find_by_id(user_id):
        """Find a user by ObjectId string."""
        try:
            return mongo.db.users.find_one({"_id": ObjectId(user_id)})
        except Exception:
            return None

    @staticmethod
    def check_password(user, password):
        """Verify a password against the stored hash."""
        return check_password_hash(user["password"], password)

