from flask import Blueprint, request, jsonify, session
from models.user_model import User
from flask_jwt_extended import create_access_token
from datetime import timedelta

auth_bp = Blueprint("auth", __name__)

# ---------------------------
# REGISTER
# ---------------------------
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(force=True)
    if not data.get("username") or not data.get("email") or not data.get("password"):
        return jsonify({"error": "All fields are required"}), 400

    try:
        user_id = User.create_user(data["username"], data["email"], data["password"])

        # ✅ identity must be a STRING; add whatever extra you like in additional_claims
        access_token = create_access_token(
            identity=str(user_id),
            additional_claims={"username": data["username"]},
            expires_delta=timedelta(hours=1),
        )

        return jsonify({
            "message": "User registered",
            "user_id": str(user_id),
            "token": access_token,
            "username": data["username"],
        }), 201

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ---------------------------
# LOGIN
# ---------------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(force=True)
    if not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password required"}), 400

    user = User.find_by_email(data["email"])
    if user and User.check_password(user, data["password"]):
        session["user_id"] = str(user["_id"])

        access_token = create_access_token(
            identity=str(user["_id"]),
            additional_claims={"username": user["username"]},
            expires_delta=timedelta(hours=1),
        )

        return jsonify({
            "message": "Login successful",
            "user_id": str(user["_id"]),
            "token": access_token,
            "username": user["username"],
        }), 200

    return jsonify({"error": "Invalid credentials"}), 401
