# Chunk 1: Imports
from flask import Flask, jsonify, request
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
import os
from dotenv import load_dotenv

# Explanation:
# - Flask: Web framework for the API.
# - pymongo: Connects to MongoDB for data storage.
# - flask_jwt_extended: Handles JWT authentication (key security component).
# - os and dotenv: Load environment variables securely.
# - Security Focus: JWTManager will manage token creation/validation, ensuring secure access control.

# Chunk 2: Flask Setup
app = Flask(__name__)

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
DB_NAME = 'union_involvement'
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key')  # Change this in production!

# JWT Configuration
app.config['JWT_SECRET_KEY'] = SECRET_KEY
jwt = JWTManager(app)

# Explanation:
# - Flask app initialized.
# - MONGO_URI: Database connection string from .env (securely hidden).
# - SECRET_KEY: Used to sign JWT tokens; defaults to a placeholder if not in .env (change for production).
# - JWT Setup: Links Flask with JWTManager using the secret key.
# - Security Focus: SECRET_KEY must be strong and unique to prevent token forgery. .env keeps it out of code.

# Chunk 3: MongoDB Connection
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

# Explanation:
# - Lazy connection to MongoDB (connects only when needed).
# - Security Focus: MONGO_URI from .env avoids hardcoding credentials. Exceptions are caught to prevent crashes exposing server details.

# Chunk 4: Login Endpoint
@app.route('/api/login', methods=['POST'])
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

# Explanation:
# - POST /api/login: Accepts username/password in JSON.
# - Hardcoded Check: Temporary `admin`/`password123` for demo.
# - DB Lookup: Example of finding a user in MongoDB (extend this in production).
# - Token Creation: create_access_token generates a JWT tied to user’s _id.
# - Security Focus: Returns 401 if credentials fail. In production, use hashed passwords (e.g., bcrypt) instead of plaintext.

# Chunk 5: Protected Endpoint Example (Get Users)
@app.route('/api/users', methods=['GET'])
@jwt_required()
def get_users():
    db = connect_to_mongo()
    try:
        users = list(db.Users.find())
        for user in users:
            user['_id'] = str(user['_id'])
        return jsonify(users)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch users'}), 500

# Explanation:
# - GET /api/users: Fetches all users from MongoDB.
# - @jwt_required(): Ensures a valid JWT is in the Authorization header.
# - Data Processing: Converts MongoDB _id to string for JSON compatibility.
# - Security Focus: Without a valid token, this returns a 401 error automatically (handled by flask-jwt-extended).

# Chunk 6: Another Protected Endpoint (Get Vendors)
@app.route('/api/vendors', methods=['GET'])
@jwt_required()
def get_vendors():
    db = connect_to_mongo()
    try:
        vendors = list(db.Vendors.find())
        for vendor in vendors:
            vendor['_id'] = str(vendor['_id'])
        return jsonify(vendors)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch vendors'}), 500

# Explanation:
# - Similar to /api/users, but for vendors.
# - Security Focus: Same JWT protection applies; only authenticated users access this.

# Chunk 7: Main Execution
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)

# Explanation:
# - Runs the Flask server on port 5000, accessible externally (0.0.0.0).
# - debug=True: Useful for development, but disable in production to avoid exposing stack traces.
# - Security Focus: In production, use a WSGI server (e.g., Gunicorn) with HTTPS.
