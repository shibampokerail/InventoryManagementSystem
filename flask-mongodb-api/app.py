from flask import Flask, jsonify, request
from pymongo import MongoClient
from bson.objectid import ObjectId
import os
from dotenv import load_dotenv

# Initialize Flask app
app = Flask(__name__)

# Load environment variables from .env file
load_dotenv()

# MongoDB connection settings
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
DB_NAME = 'union_involvement'

# Cached connection to MongoDB
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

# API Routes

# Get all vendors
@app.route('/api/vendors', methods=['GET'])
def get_vendors():
    db = connect_to_mongo()
    try:
        vendors = list(db.Vendors.find())
        # Convert ObjectId to string for JSON serialization
        for vendor in vendors:
            vendor['_id'] = str(vendor['_id'])
        return jsonify(vendors)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch vendors'}), 500

# Get all inventory items
@app.route('/api/inventory-items', methods=['GET'])
def get_inventory_items():
    db = connect_to_mongo()
    try:
        items = list(db.InventoryItems.find())
        for item in items:
            item['_id'] = str(item['_id'])
        return jsonify(items)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch inventory items'}), 500

# Get a single inventory item by ID
@app.route('/api/inventory-items/<id>', methods=['GET'])
def get_inventory_item(id):
    db = connect_to_mongo()
    try:
        item = db.InventoryItems.find_one({'_id': ObjectId(id)})
        if not item:
            return jsonify({'error': 'Item not found'}), 404
        item['_id'] = str(item['_id'])
        return jsonify(item)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch item'}), 500

# Get all users
@app.route('/api/users', methods=['GET'])
def get_users():
    db = connect_to_mongo()
    try:
        users = list(db.Users.find())
        for user in users:
            user['_id'] = str(user['_id'])
        return jsonify(users)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch users'}), 500

# Get all orders
@app.route('/api/orders', methods=['GET'])
def get_orders():
    db = connect_to_mongo()
    try:
        orders = list(db.Orders.find())
        for order in orders:
            order['_id'] = str(order['_id'])
            order['itemId'] = str(order['itemId'])
            order['vendorId'] = str(order['vendorId'])
        return jsonify(orders)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch orders'}), 500

# Get all vendor-items
@app.route('/api/vendor-items', methods=['GET'])
def get_vendor_items():
    db = connect_to_mongo()
    try:
        vendor_items = list(db.VendorItems.find())
        for vi in vendor_items:
            vi['_id'] = str(vi['_id'])
            vi['vendorId'] = str(vi['vendorId'])
            vi['itemId'] = str(vi['itemId'])
        return jsonify(vendor_items)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch vendor-items'}), 500

# Get all notifications
@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    db = connect_to_mongo()
    try:
        notifications = list(db.Notifications.find())
        for notification in notifications:
            notification['_id'] = str(notification['_id'])
        return jsonify(notifications)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch notifications'}), 500

# Get all logs
@app.route('/api/logs', methods=['GET'])
def get_logs():
    db = connect_to_mongo()
    try:
        logs = list(db.Logs.find())
        for log in logs:
            log['_id'] = str(log['_id'])
            log['userId'] = str(log['userId'])
            if 'itemId' in log['details']:
                log['details']['itemId'] = str(log['details']['itemId'])
        return jsonify(logs)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch logs'}), 500

# Get all inventory usage
@app.route('/api/inventory-usage', methods=['GET'])
def get_inventory_usage():
    db = connect_to_mongo()
    try:
        usage = list(db.InventoryUsage.find())
        for u in usage:
            u['_id'] = str(u['_id'])
            u['itemId'] = str(u['itemId'])
            u['userId'] = str(u['userId'])
        return jsonify(usage)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch inventory usage'}), 500

# Run the server
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
