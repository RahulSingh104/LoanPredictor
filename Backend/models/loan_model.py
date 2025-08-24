# Backend/models/loan_model.py
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
from Backend.config import MONGO_URI

client = MongoClient(MONGO_URI)
db = client["loan_predictor"]   # your DB name
loans_collection = db["loans"]

def serialize_loan(loan):
    return {
        "id": str(loan["_id"]),
        "loan_id": loan.get("loan_id"),
        "user_id": loan.get("user_id"),
        "amount": loan.get("amount"),
        "status": loan.get("status"),
        "date": loan.get("date", datetime.utcnow().strftime("%Y-%m-%d")),
    }
