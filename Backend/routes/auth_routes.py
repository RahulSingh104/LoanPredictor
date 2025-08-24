# routes/auth_routes.py
from flask import Blueprint, request, jsonify, session
from models.user_model import User
from config import Config
import jwt
import datetime

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

        # ✅ issue JWT with user_id + username
        token = jwt.encode(
            {
                "user_id": str(user_id),
                "username": data["username"],
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1),
            },
            Config.JWT_SECRET,
            algorithm="HS256",
        )

        return jsonify({
            "message": "User registered",
            "user_id": str(user_id),
            "token": token,
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

        # ✅ include user_id + username in JWT
        token = jwt.encode(
            {
                "user_id": str(user["_id"]),
                "username": user["username"],
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1),
            },
            Config.JWT_SECRET,
            algorithm="HS256",
        )

        return jsonify({
            "message": "Login successful",
            "user_id": str(user["_id"]),
            "token": token,
            "username": user["username"],
        }), 200

    return jsonify({"error": "Invalid credentials"}), 401
