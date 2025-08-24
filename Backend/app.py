import os
import sys
import tempfile
import shutil
import pickle
from pathlib import Path
from datetime import datetime, timedelta
import threading
import json
import io

import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

import jwt  # PyJWT

# ✅ Ensure package imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# -------------------------------
# Load .env from root folder
# -------------------------------
ROOT_DIR = Path(__file__).resolve().parent.parent  # D:\LoanPredictor
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
MODEL_PATH = ROOT_DIR / "backend" / "model" / "loan_pipeline.pkl"
BACKUP_DIR = ROOT_DIR / "backend" / "model" / "backups"
META_PATH = ROOT_DIR / "backend" / "model" / "loan_pipeline_meta.json"
BACKUP_DIR.mkdir(parents=True, exist_ok=True)

ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "changeme")

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

# ✅ Allow frontend React app (both localhost & 127.0.0.1)
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
CORS(app, resources={r"/*": {"origins": allowed_origins}}, supports_credentials=True)

# ✅ Configure Mongo
app.config.from_object(Config)
mongo.init_app(app)
print("🔗 Mongo URI in use:", app.config.get("MONGO_URI"))

# ✅ Register Auth routes
app.register_blueprint(auth_bp, url_prefix="/api/auth")

# -------------------------------
# Model Helpers
# -------------------------------
def load_pipeline(path=MODEL_PATH):
    with open(path, "rb") as f:
        pipeline = pickle.load(f)
    return pipeline

def save_pipeline_atomic(pipeline, path=MODEL_PATH):
    tmp_fd, tmp_path = tempfile.mkstemp(suffix=".pkl")
    os.close(tmp_fd)
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
# Startup: load model if exists
# -------------------------------
try:
    model = load_pipeline()
    app.logger.info("Loaded pipeline from %s", MODEL_PATH)
except Exception as e:
    model = None
    app.logger.warning("No model loaded at startup: %s", e)

# -------------------------------
# Auth helpers
# -------------------------------
def _extract_token():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    return auth.split(" ", 1)[1].strip()

def current_user_claims():
    """Decodes JWT Bearer token and returns claims."""
    token = _extract_token()
    if not token:
        return None, ("Missing or invalid Authorization header", 401)
    try:
        claims = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
        return claims, None
    except jwt.ExpiredSignatureError:
        return None, ("Token expired", 401)
    except jwt.InvalidTokenError:
        return None, ("Invalid token", 401)

def require_auth():
    claims, err = current_user_claims()
    if err:
        return None, jsonify({"error": err[0]}), err[1]
    user_id = str(claims.get("user_id") or claims.get("_id") or claims.get("id") or "")
    if not user_id:
        return None, jsonify({"error": "user_id missing in token"}), 401
    return {"user_id": user_id, "claims": claims}, None, None

# -------------------------------
# Routes
# -------------------------------
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"ok": True, "model_loaded": model is not None})

=== Prediction Routes ==========================================
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

# ✅ Extra alias for frontend (/api/predict)
@app.route("/api/predict", methods=["POST"])
def api_predict():
    return predict()

# === Loan Routes =================================================
@app.route("/api/loan/apply", methods=["POST"])
def loan_apply():
    auth, resp, code = require_auth()
    if resp:
        return resp, code
    payload = request.get_json(silent=True) or {}
    doc = {
        "user_id": auth["user_id"],
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
def loan_my():
    auth, resp, code = require_auth()
    if resp:
        return resp, code
    cur = mongo.db.loans.find({"user_id": auth["user_id"]}).sort("created_at", -1)
    loans = []
    for d in cur:
        d["_id"] = str(d["_id"])
        loans.append(d)
    return jsonify({"loans": loans})

@app.route("/api/loan/stats", methods=["GET"])
def loan_stats():
    auth, resp, code = require_auth()
    if resp:
        return resp, code
    user_id = auth["user_id"]

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

# === Model Logs & Retrain =======================================
@app.route("/api/model/logs", methods=["GET"])
def model_logs():
    auth, resp, code = require_auth()
    if resp:
        return resp, code
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
    app.run(host="0.0.0.0", port=5001, debug=True)
