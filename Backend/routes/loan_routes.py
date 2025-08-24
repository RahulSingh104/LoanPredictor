# Backend/routes/loan_routes.py
from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from datetime import datetime

loan_bp = Blueprint("loan", __name__)

# Load MongoDB settings from .env
MONGO_URI = os.getenv("MONGO_URI")
MONGO_DBNAME = os.getenv("MONGO_DBNAME", "loanpredictor")
MONGO_COLLECTION = os.getenv("MONGO_COLLECTION", "loanapplications")

# Connect to MongoDB Atlas
client = MongoClient(MONGO_URI)
db = client[MONGO_DBNAME]
collection = db[MONGO_COLLECTION]

# --- Serialize Mongo loan documents ---
def serialize_loan(loan):
    return {
        "id": str(loan["_id"]),
        "loan_id": loan.get("loan_id"),
        "user_id": loan.get("user_id"),
        "amount": loan.get("loan_amount"),
        "status": loan.get("status"),
        "date": loan.get("date", datetime.utcnow().strftime("%Y-%m-%d")),
    }

# ✅ Save new loan application
@loan_bp.route("/loan/apply", methods=["POST"])
@jwt_required()
def apply_loan():
    try:
        user_id = get_jwt_identity()
        data = request.json

        loan_doc = {
            "loan_id": f"L{collection.count_documents({}) + 1:03}",  # L001, L002...
            "user_id": user_id,
            "loan_amount": data.get("loan_amount"),
            "status": data.get("status", "Pending"),  # default Pending unless passed
            "date": datetime.utcnow().strftime("%Y-%m-%d"),
        }

        result = collection.insert_one(loan_doc)
        return jsonify({
            "message": "Loan application saved",
            "loan": serialize_loan(loan_doc)
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ✅ Get all loans for logged-in user
@loan_bp.route("/loan/my", methods=["GET"])
@jwt_required()
def get_my_loans():
    try:
        user_id = get_jwt_identity()
        loans = list(collection.find({"user_id": user_id}))
        return jsonify({"loans": [serialize_loan(l) for l in loans]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
