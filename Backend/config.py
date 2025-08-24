import os
from dotenv import load_dotenv

# Always load .env from project root (one level up from Backend)
dotenv_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path)

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")
    MONGO_URI = os.getenv("MONGO_URI")  # Always use .env online URI
    MONGO_DBNAME = os.getenv("MONGO_DBNAME", "loanpredictor")
    MONGO_COLLECTION = os.getenv("MONGO_COLLECTION", "loanapplications")

# ✅ Add JWT secret (fixes your 500 error)
    JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key")

def preprocess_input(data):
    try:
        return [
            int(data['no_of_dependents']),
            1 if data['education'].lower() == "graduate" else 0,
            1 if data['self_employed'].lower() == "yes" else 0,
            float(data['income_annum']),
            float(data['loan_amount']),
            float(data['loan_term']),
            float(data['cibil_score']),
            float(data['residential_assets_value']),
            float(data['commercial_assets_value']),
            float(data['luxury_assets_value']),
            float(data['bank_asset_value']),
        ]
    except Exception as e:
        raise ValueError("Invalid input data format: " + str(e))
