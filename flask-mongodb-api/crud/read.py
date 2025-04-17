from flask import jsonify, logging, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from crud.utils import connect_to_mongo, api_key_or_jwt_required
from bson.objectid import ObjectId
from bson.errors import InvalidId 
import logging
# Get all users
@api_key_or_jwt_required()
def get_users():
    db = connect_to_mongo()
    try:
        users = list(db.Users.find())
        for user in users:
            user['_id'] = str(user['_id'])
            user['slackId'] = user.get('slackId', '')
        return jsonify(users)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch users'}), 500

@api_key_or_jwt_required()
def get_user(id):
    db = connect_to_mongo()
    try:
        # Try to find user by ID first
        try:
            user = db.Users.find_one({'_id': ObjectId(id)})
        except InvalidId:
            user = None  # Invalid ObjectId, proceed to email lookup
            
        # If no user found by ID, try by email
        if not user:
            user = db.Users.find_one({'email': id})
        if not user:
            user = db.Users.find_one({'name': id})
        if user:
            user['_id'] = str(user['_id'])  # Convert ObjectId to string for JSON serialization
            return jsonify(user), 200
            
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        # Catch any other unexpected errors
        return jsonify({'error': 'An unexpected error occurred', 'details': str(e)}), 500

@api_key_or_jwt_required()
def get_current_user():
    db = connect_to_mongo()
    try:
        # Get the email from the JWT token
        # Get the user ID from the JWT token
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({'error': 'Invalid token: No identity found'}), 401

        # Find user by _id
        try:
            user = db.Users.find_one({'_id': ObjectId(user_id)})
        except InvalidId:
            return jsonify({'error': 'Invalid user ID in token'}), 400

        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Serialize user data
        user['_id'] = str(user['_id'])
        user['slackId'] = user.get('slackId', '')
        user['role'] = user.get('role', 'employee')  
        user['email'] = user.get('email', '')
        user['name'] = user.get('name', '')
        return jsonify(user), 200
    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred', 'details': str(e)}), 500



# Get all vendors
@api_key_or_jwt_required()
def get_vendors():
    db = connect_to_mongo()
    try:
        vendors = list(db.Vendors.find())
        for vendor in vendors:
            vendor['_id'] = str(vendor['_id'])
        return jsonify(vendors)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch vendors'}), 500
    
@api_key_or_jwt_required()
def get_vendor(vendor_id):
    db = connect_to_mongo()
    try:
        vendor = db.Vendors.find_one({'_id': ObjectId(vendor_id)})
        if vendor:
            vendor['_id'] = str(vendor['_id'])
            return jsonify(vendor), 200
        return jsonify({'error': 'Vendor not found'}), 404
    except Exception as e:
        return jsonify({'error': 'Failed to fetch vendor'}), 500

# Get all orders
@api_key_or_jwt_required()
def get_orders():
    db = connect_to_mongo()
    try:
        pipeline = [
            {
                "$lookup": {
                    "from": "InventoryItems",
                    "localField": "itemId",
                    "foreignField": "_id",
                    "as": "item"
                }
            },
            {"$unwind": {"path": "$item", "preserveNullAndEmptyArrays": True}},
            {
                "$lookup": {
                    "from": "Vendors",
                    "localField": "vendorId",
                    "foreignField": "_id",
                    "as": "vendor"
                }
            },
            {"$unwind": {"path": "$vendor", "preserveNullAndEmptyArrays": True}},
            {
                "$project": {
                    "_id": 1,
                    "itemId": 1,
                    "vendorId": 1,
                    "quantity": 1,
                    "orderDate": 1,
                    "expectedDelivery": 1,
                    "status": 1,
                    "itemName": {"$ifNull": ["$item.name", "Unknown Item"]},
                    "vendorName": {"$ifNull": ["$vendor.name", "Unknown Vendor"]}
                }
            }
        ]
        orders = list(db.Orders.aggregate(pipeline))
        for order in orders:
            order['_id'] = str(order['_id'])
            order['itemId'] = str(order['itemId'])
            order['vendorId'] = str(order['vendorId'])
        return jsonify(orders), 200
    except Exception as e:
        return jsonify({'error': 'Failed to fetch orders', 'details': str(e)}), 500

# Get all vendor-items
@api_key_or_jwt_required()
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

@api_key_or_jwt_required()
def get_items_by_vendor(vendor_id):
    db = connect_to_mongo()
    vendor_items = list(db.VendorItems.find({'vendorId': ObjectId(vendor_id)}))
    item_ids = [ObjectId(item['itemId']) for item in vendor_items]
    items = list(db.InventoryItems.find({'_id': {'$in': item_ids}}))
    for item in items:
        item['_id'] = str(item['_id'])
    return jsonify(items), 200


# Get all notifications
@api_key_or_jwt_required()
def get_notifications():
    db = connect_to_mongo()
    try:
        notifications = list(db.Notifications.find())
        for notification in notifications:
            notification['_id'] = str(notification['_id'])
            notification['read'] = notification.get('read', False)
        return jsonify(notifications)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch notifications'}), 500

# Get all logs
@api_key_or_jwt_required()
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
@api_key_or_jwt_required()
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

# Get all inventory items
@api_key_or_jwt_required()
def get_inventory_items():
    db = connect_to_mongo()
    query = {}
    try:
        if 'name' in request.args:
            query['name'] = {'$regex': request.args['name'], '$options': 'i'}
        items = list(db.InventoryItems.find(query))
        for item in items:
            item['_id'] = str(item['_id'])
        return jsonify(items)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch inventory items'}), 500

# Read a single Inventory Item by ID
@api_key_or_jwt_required()
def get_inventory_item(item_id):
    try:
        # Validate ObjectId
        try:
            object_id = ObjectId(item_id)
        except InvalidId as e:
            logging.error(f"Invalid ObjectId format for item_id {item_id}: {str(e)}")
            return jsonify({'error': 'Invalid item ID format'}), 400

        # Connect to MongoDB
        db = connect_to_mongo()
        # Query for the item
        item = db.InventoryItems.find_one({'_id': object_id})
        if item:
            item['_id'] = str(item['_id'])
            return jsonify(item), 200
        return jsonify({'error': 'Item not found'}), 404

    except Exception as e:
        logging.error(f"Error retrieving inventory item {item_id}: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# Read a single Vendor Item by ID
@api_key_or_jwt_required()
def get_vendor_item(vendor_item_id):
    db = connect_to_mongo()
    vendor_item = db.VendorItems.find_one({'_id': ObjectId(vendor_item_id)})
    if vendor_item:
        vendor_item['_id'] = str(vendor_item['_id'])
        vendor_item['vendorId'] = str(vendor_item['vendorId'])
        vendor_item['itemId'] = str(vendor_item['itemId'])
        return jsonify(vendor_item), 200
    return jsonify({'error': 'Vendor Item not found'}), 404

# Get Inventory Usage by Item
@api_key_or_jwt_required()
def get_usage_by_item(item_id):
    db = connect_to_mongo()
    usages = list(db.InventoryUsage.find({'itemId': ObjectId(item_id)}))
    for usage in usages:
        usage['_id'] = str(usage['_id'])
        usage['itemId'] = str(usage['itemId'])
        usage['userId'] = str(usage['userId'])
    return jsonify(usages), 200

logging.basicConfig(level=logging.INFO, filename='app.log', format='%(asctime)s [%(levelname)s] %(message)s')
@api_key_or_jwt_required()
def get_slack_management():
    try:
        db = connect_to_mongo()
        if db is None:
            logging.error("Failed to connect to MongoDB")
            return jsonify({'error': 'Database connection failed'}), 500

        config = db.SlackManagement.find_one()
        if config:
            config['_id'] = str(config['_id'])
            return jsonify(config), 200
        return jsonify({'error': 'Slack management configuration not found'}), 404

    except Exception as e:
        logging.error(f"Error retrieving slack management configuration: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred', 'details': str(e)}), 500