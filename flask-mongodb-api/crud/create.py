from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from crud.utils import connect_to_mongo, require_role, api_key_or_jwt_required
from bson.objectid import ObjectId
from datetime import datetime

# Create a User
@require_role('admin')
def create_user():
    db = connect_to_mongo()
    data = request.get_json()
    if not data or not all(key in data for key in ['name', 'email', 'role', 'slackId']):
        return jsonify({'error': 'Missing required fields: name, email, role, slackId'}), 400

    new_user = {
        'name': data['name'],
        'email': data['email'],
        'role': data['role'],
        'slackId': data['slackId'],
        'created_at': datetime.utcnow()
    }
    result = db.Users.insert_one(new_user)
    new_user['_id'] = str(result.inserted_id)
    return jsonify(new_user), 201

# Create a Vendor
@api_key_or_jwt_required()
def create_vendor():
    db = connect_to_mongo()
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({'error': 'Missing required field: name'}), 400

    new_vendor = {
        'name': data['name'],
        'contact': data.get('contact', ''),
        'created_at': datetime.utcnow()
    }
    result = db.Vendors.insert_one(new_vendor)
    new_vendor['_id'] = str(result.inserted_id)
    return jsonify(new_vendor), 201

# Create an Inventory Item
@api_key_or_jwt_required()
def create_inventory_item():
    db = connect_to_mongo()
    data = request.get_json()

    # Define required fields based on the schema
    required_fields = ['name', 'category', 'quantity', 'minQuantity', 'unit', 'location', 'status', 'condition']
    if not data or not all(key in data for key in ['name', 'quantity', 'location']):
        return jsonify({'error': 'Missing required fields: name, quantity, location'}), 400

    # Create new item with all fields (required and optional)
    new_item = {
        'name': data.get('name'),
        'category': data.get('category', 'Uncategorized'),  # Default if not provided
        'quantity': int(data.get('quantity')),
        'minQuantity': int(data.get('minQuantity', 0)),  # Default to 0 if not provided
        'unit': data.get('unit', 'pieces'),  # Default to 'pieces' if not provided
        'location': data.get('location'),
        'status': data.get('status', 'AVAILABLE'),  # Default to 'AVAILABLE' if not provided
        'condition': data.get('condition', 'OK'),  # Default to 'OK' if not provided
        'created_at': datetime.utcnow()
    }

    # Validate required fields
    missing_fields = [field for field in required_fields if not new_item[field]]
    if missing_fields:
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

    # Validate quantity and minQuantity to be non-negative
    if new_item['quantity'] < 0 or new_item['minQuantity'] < 0:
        return jsonify({'error': 'Quantity and minQuantity must be non-negative'}), 400

    # Insert into the database
    result = db.InventoryItems.insert_one(new_item)
    new_item['_id'] = str(result.inserted_id)
    return jsonify(new_item), 201

# Create an Order
@api_key_or_jwt_required()
def create_order():
    db = connect_to_mongo()
    data = request.get_json()
    if not data or not all(key in data for key in ['itemId', 'vendorId', 'quantity']):
        return jsonify({'error': 'Missing required fields: itemId, vendorId, quantity'}), 400

    new_order = {
        'itemId': ObjectId(data['itemId']),
        'vendorId': ObjectId(data['vendorId']),
        'quantity': int(data['quantity']),
        'status': data.get('status', 'pending'),
        'created_at': datetime.utcnow()
    }
    result = db.Orders.insert_one(new_order)
    new_order['_id'] = str(result.inserted_id)
    new_order['itemId'] = str(new_order['itemId'])
    new_order['vendorId'] = str(new_order['vendorId'])
    return jsonify(new_order), 201

# Create a Vendor-Item
@api_key_or_jwt_required()
def create_vendor_item():
    db = connect_to_mongo()
    data = request.get_json()
    if not data or not all(key in data for key in ['vendorId', 'itemId', 'price']):
        return jsonify({'error': 'Missing required fields: vendorId, itemId, price'}), 400

    new_vendor_item = {
        'vendorId': ObjectId(data['vendorId']),
        'itemId': ObjectId(data['itemId']),
        'price': float(data['price']),
        'created_at': datetime.utcnow()
    }
    result = db.VendorItems.insert_one(new_vendor_item)
    new_vendor_item['_id'] = str(result.inserted_id)
    new_vendor_item['vendorId'] = str(new_vendor_item['vendorId'])
    new_vendor_item['itemId'] = str(new_vendor_item['itemId'])
    return jsonify(new_vendor_item), 201

# Create a Notification
@api_key_or_jwt_required()
def create_notification():
    db = connect_to_mongo()
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': 'Missing required field: message'}), 400

    new_notification = {
        'message': data['message'],
        'created_at': datetime.utcnow()
    }
    result = db.Notifications.insert_one(new_notification)
    new_notification['_id'] = str(result.inserted_id)
    return jsonify(new_notification), 201

# Create a Log
@api_key_or_jwt_required()
def create_log():
    db = connect_to_mongo()
    data = request.get_json()
    if not data or not all(key in data for key in ['userId', 'action']):
        return jsonify({'error': 'Missing required fields: userId, action'}), 400

    new_log = {
        'userId': ObjectId(data['userId']),
        'action': data['action'],
        'details': data.get('details', {}),
        'created_at': datetime.utcnow()
    }
    result = db.Logs.insert_one(new_log)
    new_log['_id'] = str(result.inserted_id)
    new_log['userId'] = str(new_log['userId'])
    if 'itemId' in new_log['details']:
        new_log['details']['itemId'] = str(new_log['details']['itemId'])
    return jsonify(new_log), 201

# Create an Inventory Usage Record
@api_key_or_jwt_required()
def create_inventory_usage():
    db = connect_to_mongo()
    data = request.get_json()
    if not data or not all(key in data for key in ['itemId', 'userId', 'quantityUsed']):
        return jsonify({'error': 'Missing required fields: itemId, userId, quantityUsed'}), 400

    new_usage = {
        'itemId': ObjectId(data['itemId']),
        'userId': ObjectId(data['userId']),
        'quantityUsed': int(data['quantityUsed']),
        'created_at': datetime.utcnow()
    }
    result = db.InventoryUsage.insert_one(new_usage)
    new_usage['_id'] = str(result.inserted_id)
    new_usage['itemId'] = str(new_usage['itemId'])
    new_usage['userId'] = str(new_usage['userId'])
    return jsonify(new_usage), 201


@api_key_or_jwt_required()
@require_role('admin')  # Only admins can create the configuration
def create_slack_management():
    db = connect_to_mongo()
    if db is None:
        return jsonify({'error': 'Database connection failed'}), 500

    # Check if a document already exists
    existing_config = db.SlackManagement.find_one()
    if existing_config:
        return jsonify({'error': 'Slack management configuration already exists. Use update to modify.'}), 400

    data = request.get_json()
    if not data or not all(key in data for key in ['bot_token', 'app_token', 'user_token']):
        return jsonify({'error': 'Missing required fields: bot_token, app_token, user_token'}), 400

    # Channel IDs are optional; default to empty list if not provided
    channel_ids = data.get('channel_ids', [])

    new_config = {
        'bot_token': data['bot_token'],
        'app_token': data['app_token'],
        'user_token': data['user_token'],
        'channel_ids': channel_ids,
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat()
    }

    result = db.SlackManagement.insert_one(new_config)
    new_config['_id'] = str(result.inserted_id)
    return jsonify(new_config), 201