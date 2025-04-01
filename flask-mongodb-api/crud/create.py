from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from crud.utils import connect_to_mongo, require_role
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
@jwt_required()
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
@jwt_required()
def create_inventory_item():
    db = connect_to_mongo()
    data = request.get_json()
    if not data or not all(key in data for key in ['name', 'quantity', 'location']):
        return jsonify({'error': 'Missing required fields: name, quantity, location'}), 400

    new_item = {
        'name': data['name'],
        'quantity': int(data['quantity']),
        'location': data['location'],
        'created_at': datetime.utcnow()
    }
    result = db.InventoryItems.insert_one(new_item)
    new_item['_id'] = str(result.inserted_id)
    return jsonify(new_item), 201

# Create an Order
@jwt_required()
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
@jwt_required()
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
@jwt_required()
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
@jwt_required()
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
@jwt_required()
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
