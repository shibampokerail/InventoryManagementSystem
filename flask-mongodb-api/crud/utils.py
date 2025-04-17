from flask import jsonify, request
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_jwt_extended import get_jwt, jwt_required, create_access_token, get_jwt_identity
import os
from dotenv import load_dotenv
from functools import wraps
from datetime import datetime
from datetime import timedelta
import time
from flask_socketio import SocketIO
import requests

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv('MONGO_URI')
DB_NAME = os.getenv('DB_NAME')
SLACKBOT_API_KEY = os.getenv("SLACKBOT_API_KEY")
SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL")
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

# Helper function to convert non-JSON-serializable objects to JSON-serializable formats
def convert_to_json_serializable(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, datetime):
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {k: convert_to_json_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_json_serializable(item) for item in obj]
    return obj

#sends message to slack when item has been updated.
def send_slack_message(text):
    payload = {"text": text}
    try:
        response = requests.post(SLACK_WEBHOOK_URL, json=payload)
        response.raise_for_status()
        print(" Slack message sent.")
    except Exception as e:
        print(f" Failed to send Slack message: {e}")

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
retry_delay = 5
max_delay = 60
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

                        # Send to Slack
                        item_name = updated_doc.get("name") or updated_doc.get("item") or "an item"
                        send_slack_message(f"*{collection_name.replace('_', ' ').title()}* was updated: `{item_name}` (ID: {document_id})")

                    elif operation == "delete":                        
                        print(f"Emitting delete event for {collection_name}: {document_id}")
                        socketio.emit(f"{collection_name}_delete", {"_id": document_id}, namespace="/realtime")
                    else:
                        print(f"Unhandled operation type {operation} in {collection_name}: {change}")
                    retry_delay = 5  # Reset delay on success                    
        except Exception as e:
            print(f"Error watching {collection_name}: {e}. Retrying in 5 seconds...")
            time.sleep(retry_delay)
            retry_delay = min(retry_delay * 2, max_delay)

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
    # Set the token to expire in 6 hour (you can change this as needed)
    expires = timedelta(hours=6)

    access_token = create_access_token(identity=str(user['_id']), expires_delta=expires)
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
    """
    Retrieve statistics about inventory, categories, orders, and vendors.
    
    Returns a dictionary with the following statistics:
    - total_items: Total number of items in InventoryItems.
    - total_categories: Total number of unique categories in InventoryItems.
    - low_stock: Number of items where quantity is less than minQuantity.
    - total_orders_placed: Total number of orders with status 'placed' or 'received'.
    - total_vendors: Total number of vendors in the Vendors collection.
    """
    db = connect_to_mongo()

    # Total items
    total_items = db.InventoryItems.count_documents({})

    # Total categories (distinct categories in InventoryItems)
    total_categories = len(db.InventoryItems.distinct("category"))

    # Low stock items (quantity < minQuantity)
    low_stock = 0
    for item in db.InventoryItems.find({}, {"quantity": 1, "minQuantity": 1}):
        quantity = item.get("quantity", 0)
        # Use a default minQuantity of 10 if not specified
        min_quantity = item.get("minQuantity", 1)
        if quantity < min_quantity:
            low_stock += 1

    # Total orders placed (count orders with status "placed" or "received")
    total_orders_placed = db.Orders.count_documents({
        "status": {"$in": ["placed"]}
    })

    # Total vendors (count documents in Vendors collection)
    total_vendors = db.Vendors.count_documents({})

    return {
        "total_items": total_items,
        "total_categories": total_categories,
        "low_stock": low_stock,
        "total_orders_placed": total_orders_placed,
        "total_vendors": total_vendors,
    }
