import os
import sys
import tempfile
import shutil
import pickle
from pathlib import Path
from datetime import datetime, timedelta
import threading
import json

import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from flask_jwt_extended import (
    JWTManager, jwt_required, get_jwt_identity
)

# Ensure package imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# -------------------------------
# Load .env from root folder
# -------------------------------
ROOT_DIR = Path(__file__).resolve().parent.parent  # e.g., D:\LoanPredictor
ENV_PATH = ROOT_DIR / ".env"
if ENV_PATH.exists():
    load_dotenv(ENV_PATH)
    print(f"✅ Loaded environment from {ENV_PATH}")
else:
    print("⚠️ No .env file found in root folder")

# Local imports
from config import Config
from models.user_model import mongo
from routes.auth_routes import auth_bp

# -------------------------------
# Paths & Constants
# -------------------------------
MODEL_PATH = ROOT_DIR / "Backend" / "model" / "loan_pipeline.pkl"
BACKUP_DIR = ROOT_DIR / "Backend" / "model" / "backups"
META_PATH = ROOT_DIR / "Backend" / "model" / "loan_pipeline_meta.json"
BACKUP_DIR.mkdir(parents=True, exist_ok=True)

EXPECTED_FEATURES = [
    "no_of_dependents", "education", "self_employed",
    "income_annum", "loan_amount", "loan_term", "cibil_score",
    "residential_assets_value", "commercial_assets_value",
    "luxury_assets_value", "bank_asset_value"
]

# -------------------------------
# App Setup
# -------------------------------
model_lock = threading.Lock()
app = Flask(__name__)

# CORS
raw_origins = os.environ.get("ALLOWED_ORIGINS", "").strip()
if raw_origins:
    allowed_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
else:
    allowed_origins = ["http://localhost:5174", "http://127.0.0.1:5174"]
# CORS(app, resources={r"/api/*": {"origins": allowed_origins}}, supports_credentials=True)

CORS(app, resources={r"/*": {"origins": allowed_origins}}, supports_credentials=True)

print("Loaded ALLOWED_ORIGINS:", allowed_origins)

# Mongo/Config
app.config.from_object(Config)
mongo.init_app(app)
print("🔗 Mongo URI in use:", app.config.get("MONGO_URI"))

# JWT (one single source of truth)
app.config["JWT_SECRET_KEY"] = (
    os.environ.get("JWT_SECRET")
    or os.environ.get("JWT_SECRET_KEY")
    or getattr(Config, "JWT_SECRET", None)
    or getattr(Config, "JWT_SECRET_KEY", None)
    or "changeme"
)
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")

# -------------------------------
# JWT error handlers (nice messages instead of 422 mystery)
# -------------------------------
@jwt.unauthorized_loader
def _missing_auth(err_msg):
    return jsonify({"error": "Missing Authorization header"}), 401

@jwt.invalid_token_loader
def _invalid_token(err_msg):
    return jsonify({"error": "Invalid token", "detail": err_msg}), 401

@jwt.expired_token_loader
def _expired_token(jwt_header, jwt_data):
    return jsonify({"error": "Token expired"}), 401

@jwt.needs_fresh_token_loader
def _needs_fresh(jwt_header, jwt_data):
    return jsonify({"error": "Fresh token required"}), 401

# -------------------------------
# Model helpers
# -------------------------------
def load_pipeline(path=MODEL_PATH):
    with open(path, "rb") as f:
        pipeline = pickle.load(f)
    return pipeline

def save_pipeline_atomic(pipeline, path=MODEL_PATH):
    fd, tmp_path = tempfile.mkstemp(suffix=".pkl")
    os.close(fd)
    with open(tmp_path, "wb") as f:
        pickle.dump(pipeline, f)
    if path.exists():
        ts = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
        shutil.copy2(path, BACKUP_DIR / f"loan_pipeline_{ts}.pkl")
    os.replace(tmp_path, path)

def save_metadata(meta: dict, path=META_PATH):
    meta['saved_at'] = datetime.utcnow().isoformat() + "Z"
    with open(path, "w") as f:
        json.dump(meta, f, indent=2)
    try:
        mongo.db.retrain_logs.insert_one(meta)
    except Exception as e:
        app.logger.warning(f"Mongo retrain log failed: {e}")

# -------------------------------
# Startup
# -------------------------------
try:
    model = load_pipeline()
    app.logger.info("Loaded pipeline from %s", MODEL_PATH)
except Exception as e:
    model = None
    app.logger.warning("No model loaded at startup: %s", e)

# -------------------------------
# Routes
# -------------------------------
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"ok": True, "model_loaded": model is not None})

# Prediction Routes
@app.route("/predict", methods=["POST"])
def predict():
    global model
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    try:
        no_of_dependents = float(data.get("no_of_dependents", 0))
        education = data.get("education", "Graduate")
        self_employed = data.get("self_employed", "No")
        income_annum = float(data.get("income_annum", 0))
        loan_amount = float(data.get("loan_amount", 0))
        loan_term = float(data.get("loan_term", 0))
        cibil_score = float(data.get("cibil_score", 0))
        residential_assets = float(data.get("residential_assets_value", 0))
        commercial_assets = float(data.get("commercial_assets_value", 0))
        luxury_assets = float(data.get("luxury_assets_value", 0))
        bank_assets = float(data.get("bank_asset_value", 0))

        debt_to_income = loan_amount / income_annum if income_annum > 0 else 0
        loan_to_income = loan_amount / income_annum if income_annum > 0 else 0
        asset_coverage = (
            residential_assets + commercial_assets + luxury_assets + bank_assets
        ) / loan_amount if loan_amount > 0 else 0

        input_df = pd.DataFrame([{
            "education": education,
            "self_employed": self_employed,
            "no_of_dependents": no_of_dependents,
            "income_annum": income_annum,
            "loan_amount": loan_amount,
            "loan_term": loan_term,
            "cibil_score": cibil_score,
            "residential_assets_value": residential_assets,
            "commercial_assets_value": commercial_assets,
            "luxury_assets_value": luxury_assets,
            "bank_asset_value": bank_assets,
            "debt_to_income": debt_to_income,
            "asset_coverage": asset_coverage,
            "loan_to_income": loan_to_income
        }])

        raw_prediction = model.predict(input_df)[0]
        model_result = "Approved" if raw_prediction == 1 else "Rejected"
        model_reasons = [f"Model said: {model_result}"]

        final_result = model_result
        rule_reasons = []
        if cibil_score < 650:
            rule_reasons.append("CIBIL score is too low (<650).")
            final_result = "Rejected"
        if loan_to_income > 2:
            rule_reasons.append("Loan-to-Income ratio is too high (>2).")
            final_result = "Rejected"
        if asset_coverage < 1:
            rule_reasons.append("Assets do not sufficiently cover the loan amount.")
            final_result = "Rejected"
        if income_annum < 200000:
            rule_reasons.append("Annual income is too low for this loan request.")
            final_result = "Rejected"

        if final_result == "Approved" and not rule_reasons:
            rule_reasons.append("Strong financial profile.")
        elif final_result == "Rejected" and not rule_reasons:
            rule_reasons.append("Strong financial profile.")

        return jsonify({
            "model_prediction": model_result,
            "model_reasons": model_reasons,
            "final_decision": final_result,
            "final_reasons": rule_reasons
        })

    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

# Extra alias for frontend (/api/predict)
@app.route("/api/predict", methods=["POST"])
def api_predict():
    return predict()

# === Loan Routes =================================================
def _get_user_id_from_jwt():
    """Simplified: identity is exactly what we set at login/register."""
    return str(get_jwt_identity() or "")

@app.route("/api/loan/apply", methods=["POST"])
@jwt_required()
def loan_apply():
    user_id = _get_user_id_from_jwt()
    if not user_id:
        return jsonify({"error": "user_id missing in token"}), 401

    payload = request.get_json(silent=True) or {}
    doc = {
        "user_id": user_id,
        "loan_amount": float(payload.get("loan_amount", 0)),
        "income_annum": float(payload.get("income_annum", 0)),
        "cibil_score": float(payload.get("cibil_score", 0)),
        "status": payload.get("status", "Pending"),
        "created_at": payload.get("created_at") or datetime.utcnow().isoformat() + "Z",
        "raw": payload.get("raw") or None
    }
    mongo.db.loans.insert_one(doc)
    return jsonify({"ok": True, "loan": doc}), 201

@app.route("/api/loan/my", methods=["GET"])
@jwt_required()
def loan_my():
    user_id = _get_user_id_from_jwt()
    if not user_id:
        return jsonify({"error": "user_id missing in token"}), 401

    cur = mongo.db.loans.find({"user_id": user_id}).sort("created_at", -1)
    loans = []
    for d in cur:
        d["_id"] = str(d["_id"])
        loans.append(d)
    return jsonify({"loans": loans})

@app.route("/api/loan/stats", methods=["GET"])
@jwt_required()
def loan_stats():
    user_id = _get_user_id_from_jwt()
    if not user_id:
        return jsonify({"error": "user_id missing in token"}), 401

    total = mongo.db.loans.count_documents({"user_id": user_id})
    approved = mongo.db.loans.count_documents({"user_id": user_id, "status": "Approved"})
    rejected = mongo.db.loans.count_documents({"user_id": user_id, "status": "Rejected"})
    approval_rate = (approved / total * 100.0) if total else 0.0
    since = (datetime.utcnow() - timedelta(days=30)).isoformat() + "Z"
    recent = mongo.db.loans.count_documents({"user_id": user_id, "created_at": {"$gte": since}})

    return jsonify({
        "total": total,
        "approved": approved,
        "rejected": rejected,
        "approval_rate": round(approval_rate, 2),
        "recent_30d": recent
    })

@app.route("/api/model/logs", methods=["GET"])
@jwt_required()
def model_logs():
    cur = mongo.db.retrain_logs.find().sort("saved_at", -1)
    logs = []
    for d in cur:
        d["_id"] = str(d["_id"])
        logs.append(d)
    return jsonify({"logs": logs})

# -------------------------------
# Error Handlers
# -------------------------------
@app.errorhandler(400)
def _bad_request(e):
    return jsonify({"error": "Bad request"}), 400

@app.errorhandler(401)
def _unauth(e):
    return jsonify({"error": "Unauthorized"}), 401

@app.errorhandler(404)
def _not_found(e):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def _server(e):
    return jsonify({"error": "Server error"}), 500

# -------------------------------
# Main
# -------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=5001, debug=True)

