from flask import jsonify, request
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity
import os
from dotenv import load_dotenv
from functools import wraps
from datetime import datetime

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv('MONGO_URI')
DB_NAME = os.getenv('DB_NAME')
SLACKBOT_API_KEY = os.getenv("SLACKBOT_API_KEY")

# MongoDB Connection
client = None
db = None

def connect_to_mongo():
    global client, db
    if client is None:
        try:
            client = MongoClient(MONGO_URI)
            db = client[DB_NAME]
            print("Connected to MongoDB")
        except Exception as e:
            print(f"Error connecting to MongoDB: {e}")
            raise
    return db

# NEW: Decorator to allow API key or JWT authentication
def api_key_or_jwt_required():
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Check for API key in headers
            api_key = request.headers.get("X-API-Key")
            if api_key and api_key == SLACKBOT_API_KEY:
                # API key is valid, bypass JWT check
                return f(*args, **kwargs)

            # If no API key, fall back to JWT authentication
            @jwt_required()
            def jwt_protected():
                return f(*args, **kwargs)
            return jwt_protected()
        return decorated_function
    return decorator

# MODIFIED: Update role-based access decorator to work with API key
def require_role(role):
    def decorator(f):
        @wraps(f)
        @api_key_or_jwt_required()  # CHANGED: Use new decorator instead of @jwt_required()
        def wrapped(*args, **kwargs):
            # Check if the request is using an API key
            if request.headers.get("X-API-Key") == SLACKBOT_API_KEY:
                # API key bypasses role check (Slackbot has full access)
                return f(*args, **kwargs)

            # If using JWT, perform role check
            user_id = get_jwt_identity()
            db = connect_to_mongo()
            user = db.Users.find_one({'_id': ObjectId(user_id)})
            if not user or user.get('role') != role:
                return jsonify({'error': f'Only {role}s can perform this action'}), 403
            return f(*args, **kwargs)
        return wrapped
    return decorator

# Login endpoint (unchanged, used for JWT authentication)
def login():
    data = request.get_json()
    email = data.get('email')

    # Validate that email is provided
    if not email:
        return jsonify({'error': 'Email is required'}), 400

    # Check if the email exists in the database
    db = connect_to_mongo()
    user = db.Users.find_one({'email': email})
    if not user:
        return jsonify({'error': 'User with this email not found in database'}), 403

    # Issue a Flask-JWT-Extended token with the user's _id
    access_token = create_access_token(identity=str(user['_id']))
    return jsonify({'access_token': access_token}), 200