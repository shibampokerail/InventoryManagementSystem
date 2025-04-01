from flask import jsonify, request
from flask_jwt_extended import jwt_required
from crud.utils import connect_to_mongo, require_role
from bson.objectid import ObjectId
from datetime import datetime

# Update a User
@require_role('admin')
def update_user(id):
    db = connect_to_mongo()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    update_data = {k: v for k, v in data.items() if k in ['name', 'email', 'role', 'slackId']}
    if not update_data:
        return jsonify({'error': 'No valid fields to update'}), 400

    update_data['updated_at'] = datetime.utcnow()
    result = db.Users.update_one({'_id': ObjectId(id)}, {'$set': update_data})
    if result.matched_count == 0:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'message': 'User updated successfully'}), 200

# Update a Vendor
@jwt_required()
def update_vendor(id):
    db = connect_to_mongo()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    update_data = {k: v for k, v in data.items() if k in ['name', 'contact']}
    if not update_data:
        return jsonify({'error': 'No valid fields to update'}), 400

    update_data['updated_at'] = datetime.utcnow()
    result = db.Vendors.update_one({'_id': ObjectId(id)}, {'$set': update_data})
    if result.matched_count == 0:
        return jsonify({'error': 'Vendor not found'}), 404
    return jsonify({'message': 'Vendor updated successfully'}), 200

# Update an Inventory Item
@jwt_required()
def update_inventory_item(id):
    db = connect_to_mongo()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    update_data = {k: v for k, v in data.items() if k in ['name', 'quantity', 'location']}
    if not update_data:
        return jsonify({'error': 'No valid fields to update'}), 400

    if 'quantity' in update_data:
        update_data['quantity'] = int(update_data['quantity'])
    update_data['updated_at'] = datetime.utcnow()
    result = db.InventoryItems.update_one({'_id': ObjectId(id)}, {'$set': update_data})
    if result.matched_count == 0:
        return jsonify({'error': 'Inventory item not found'}), 404
    return jsonify({'message': 'Inventory item updated successfully'}), 200

# Update an Order
@jwt_required()
def update_order(id):
    db = connect_to_mongo()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    update_data = {k: v for k, v in data.items() if k in ['quantity', 'status']}
    if not update_data:
        return jsonify({'error': 'No valid fields to update'}), 400

    if 'quantity' in update_data:
        update_data['quantity'] = int(update_data['quantity'])
    update_data['updated_at'] = datetime.utcnow()
    result = db.Orders.update_one({'_id': ObjectId(id)}, {'$set': update_data})
    if result.matched_count == 0:
        return jsonify({'error': 'Order not found'}), 404
    return jsonify({'message': 'Order updated successfully'}), 200

# Update a Vendor-Item
@jwt_required()
def update_vendor_item(id):
    db = connect_to_mongo()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    update_data = {k: v for k, v in data.items() if k in ['price']}
    if not update_data:
        return jsonify({'error': 'No valid fields to update'}), 400

    if 'price' in update_data:
        update_data['price'] = float(update_data['price'])
    update_data['updated_at'] = datetime.utcnow()
    result = db.VendorItems.update_one({'_id': ObjectId(id)}, {'$set': update_data})
    if result.matched_count == 0:
        return jsonify({'error': 'Vendor-item not found'}), 404
    return jsonify({'message': 'Vendor-item updated successfully'}), 200

# Update a Notification
@jwt_required()
def update_notification(id):
    db = connect_to_mongo()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    update_data = {k: v for k, v in data.items() if k in ['message']}
    if not update_data:
        return jsonify({'error': 'No valid fields to update'}), 400

    update_data['updated_at'] = datetime.utcnow()
    result = db.Notifications.update_one({'_id': ObjectId(id)}, {'$set': update_data})
    if result.matched_count == 0:
        return jsonify({'error': 'Notification not found'}), 404
    return jsonify({'message': 'Notification updated successfully'}), 200

# Update a Log
@jwt_required()
def update_log(id):
    db = connect_to_mongo()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    update_data = {k: v for k, v in data.items() if k in ['action', 'details']}
    if not update_data:
        return jsonify({'error': 'No valid fields to update'}), 400

    update_data['updated_at'] = datetime.utcnow()
    result = db.Logs.update_one({'_id': ObjectId(id)}, {'$set': update_data})
    if result.matched_count == 0:
        return jsonify({'error': 'Log not found'}), 404
    return jsonify({'message': 'Log updated successfully'}), 200

# Update an Inventory Usage Record
@jwt_required()
def update_inventory_usage(id):
    db = connect_to_mongo()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    update_data = {k: v for k, v in data.items() if k in ['quantityUsed']}
    if not update_data:
        return jsonify({'error': 'No valid fields to update'}), 400

    if 'quantityUsed' in update_data:
        update_data['quantityUsed'] = int(update_data['quantityUsed'])
    update_data['updated_at'] = datetime.utcnow()
    result = db.InventoryUsage.update_one({'_id': ObjectId(id)}, {'$set': update_data})
    if result.matched_count == 0:
        return jsonify({'error': 'Inventory usage record not found'}), 404
    return jsonify({'message': 'Inventory usage record updated successfully'}), 200
