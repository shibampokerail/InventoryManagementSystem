from flask import jsonify, request
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_jwt_extended import get_jwt, jwt_required, create_access_token, get_jwt_identity
import os
from dotenv import load_dotenv
from functools import wraps
from datetime import datetime
import threading
import time
from flask_socketio import SocketIO
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

# Helper function to convert datetime objects to ISO strings
def convert_to_json_serializable(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {k: convert_to_json_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_json_serializable(item) for item in obj]
    return obj

# Define all collections to watch
def get_collections():
    db = connect_to_mongo()
    return {
"users": db.Users,
        "vendors": db.Vendors,
        "inventory_items": db.InventoryItems,
        "orders": db.Orders,
        "vendor_items": db.VendorItems,
        "notifications": db.Notifications,
        "logs": db.Logs,
        "inventory_usage": db.InventoryUsage,
        "slack_management": db.SlackManagement
    }

# Function to watch a specific collection and broadcast changes
def watch_collection(collection_name, collection, socketio):
    while True:
        try:
            print(f"Opening Change Stream for {collection_name}...")
            with collection.watch(full_document='updateLookup') as stream:
                print(f"Change Stream opened for {collection_name}")
                for change in stream:
                    print(f"Change detected in {collection_name}: {change}")
                    operation = change["operationType"]
                    document_id = str(change["documentKey"]["_id"]) if "documentKey" in change else None

                    if operation == "insert":
                        new_doc = change["fullDocument"]
                        new_doc["_id"] = str(new_doc["_id"])
                        new_doc = convert_to_json_serializable(new_doc)
                        print(f"Emitting insert event for {collection_name}: {new_doc}")
                        socketio.emit(f"{collection_name}_insert", new_doc, namespace="/realtime")
                    elif operation == "update":
                        updated_doc = None
                        if "fullDocument" in change:
                            updated_doc = change["fullDocument"]
                            updated_doc["_id"] = str(updated_doc["_id"])
                        else:
                            # Fetch the document manually if fullDocument is missing
                            print(f"No fullDocument in update change for {collection_name}, fetching manually...")
                            updated_doc = collection.find_one({"_id": ObjectId(document_id)})
                            if updated_doc:
                                updated_doc["_id"] = str(updated_doc["_id"])
                            else:
                                print(f"Document {document_id} not found after update, skipping emit.")
                                continue

                        updated_doc = convert_to_json_serializable(updated_doc)
                        print(f"Emitting update event for {collection_name}: {updated_doc}")
                        socketio.emit(f"{collection_name}_update", updated_doc, namespace="/realtime")
                    elif operation == "delete":
                        print(f"Emitting delete event for {collection_name}: {document_id}")
                        socketio.emit(f"{collection_name}_delete", {"_id": document_id}, namespace="/realtime")
                    else:
                        print(f"Unhandled operation type {operation} in {collection_name}: {change}")
        except Exception as e:
            print(f"Error watching {collection_name}: {e}. Retrying in 5 seconds...")
            time.sleep(5)

# Start watching all collections in separate threads
def start_watching_collections(socketio: SocketIO):
    collections = get_collections()
    for name, collection in collections.items():
        print(f"Starting to watch collection: {name}")
        socketio.start_background_task(watch_collection, name, collection, socketio)


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
                # Check if the JWT is revoked
                jwt_data = get_jwt()
                jti = jwt_data.get("jti")
                db = connect_to_mongo()
                if db is None:
                    return jsonify({'error': 'Database connection failed'}), 500

                revoked_token = db.RevokedTokens.find_one({"jti": jti})
                if revoked_token:
                    return jsonify({'error': 'Token has been revoked'}), 401

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

# Logout endpoint
@api_key_or_jwt_required()
def logout():
    jwt_data = get_jwt()
    jti = jwt_data.get("jti")
    db = connect_to_mongo()
    db.RevokedTokens.insert_one({"jti": jti})
    return jsonify({"message": "Successfully logged out"}), 200

# Stats endpoint
@api_key_or_jwt_required()
def get_stats():
    db = connect_to_mongo()
    total_items = db.InventoryItems.count_documents({})
    low_stock = db.InventoryItems.count_documents({"quantity": {"$lt": 10}})
    items_checked_out = sum(item.get("checked_out", 0) for item in db.InventoryItems.find())

    return {
        "total_items": total_items,
        "low_stock": low_stock,
        "items_checked_out": items_checked_out,
    }