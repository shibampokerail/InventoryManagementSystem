from flask import jsonify
from flask_jwt_extended import jwt_required
from crud.utils import connect_to_mongo, require_role, api_key_or_jwt_required
from bson.objectid import ObjectId

# Delete a User
@require_role('admin')
def delete_user(id):
    db = connect_to_mongo()
    result = db.Users.delete_one({'_id': ObjectId(id)})
    if result.deleted_count == 0:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'message': 'User deleted successfully'}), 200

# Delete a Vendor
@api_key_or_jwt_required()
def delete_vendor(id):
    db = connect_to_mongo()
    result = db.Vendors.delete_one({'_id': ObjectId(id)})
    if result.deleted_count == 0:
        return jsonify({'error': 'Vendor not found'}), 404
    return jsonify({'message': 'Vendor deleted successfully'}), 200

# Delete an Inventory Item
@api_key_or_jwt_required()
def delete_inventory_item(id):
    db = connect_to_mongo()
    result = db.InventoryItems.delete_one({'_id': ObjectId(id)})
    if result.deleted_count == 0:
        return jsonify({'error': 'Inventory item not found'}), 404
    return jsonify({'message': 'Inventory item deleted successfully'}), 200

# Delete an Order
@api_key_or_jwt_required()
def delete_order(id):
    db = connect_to_mongo()
    result = db.Orders.delete_one({'_id': ObjectId(id)})
    if result.deleted_count == 0:
        return jsonify({'error': 'Order not found'}), 404
    return jsonify({'message': 'Order deleted successfully'}), 200

# Delete a Vendor-Item
@api_key_or_jwt_required()
def delete_vendor_item(id):
    db = connect_to_mongo()
    result = db.VendorItems.delete_one({'_id': ObjectId(id)})
    if result.deleted_count == 0:
        return jsonify({'error': 'Vendor-item not found'}), 404
    return jsonify({'message': 'Vendor-item deleted successfully'}), 200

# Delete a Notification
@api_key_or_jwt_required()
def delete_notification(id):
    db = connect_to_mongo()
    result = db.Notifications.delete_one({'_id': ObjectId(id)})
    if result.deleted_count == 0:
        return jsonify({'error': 'Notification not found'}), 404
    return jsonify({'message': 'Notification deleted successfully'}), 200

# Delete a Log
@api_key_or_jwt_required()
def delete_log(id):
    db = connect_to_mongo()
    result = db.Logs.delete_one({'_id': ObjectId(id)})
    if result.deleted_count == 0:
        return jsonify({'error': 'Log not found'}), 404
    return jsonify({'message': 'Log deleted successfully'}), 200

# Delete an Inventory Usage Record
@api_key_or_jwt_required()
def delete_inventory_usage(id):
    db = connect_to_mongo()
    result = db.InventoryUsage.delete_one({'_id': ObjectId(id)})
    if result.deleted_count == 0:
        return jsonify({'error': 'Inventory usage record not found'}), 404
    return jsonify({'message': 'Inventory usage record deleted successfully'}), 200
