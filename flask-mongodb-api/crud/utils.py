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
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
DB_NAME = 'union_involvement'

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

# Role-based access decorator
def require_role(role):
    def decorator(f):
        @wraps(f)
        @jwt_required()
        def wrapped(*args, **kwargs):
            user_id = get_jwt_identity()
            db = connect_to_mongo()
            user = db.Users.find_one({'_id': ObjectId(user_id)})
            if not user or user.get('role') != role:
                return jsonify({'error': f'Only {role}s can perform this action'}), 403
            return f(*args, **kwargs)
        return wrapped
    return decorator

# Login endpoint
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    # Hardcoded for demo; replace with DB check in production
    if username == 'admin' and password == 'password123':
        db = connect_to_mongo()
        user = db.Users.find_one({'name': 'Admin User'})  # Example DB check
        if user:
            access_token = create_access_token(identity=str(user['_id']))
            return jsonify({'access_token': access_token}), 200
    return jsonify({'error': 'Invalid credentials'}), 401
