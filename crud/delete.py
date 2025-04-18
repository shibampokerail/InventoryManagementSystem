from flask import jsonify, request
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

    # Delete all VendorItems linked to the deleted Vendor
    vendor_items_result = db.VendorItems.delete_many({'vendorId': ObjectId(id)})

    return jsonify({
        'message': 'Vendor deleted successfully',
        'vendor_items_deleted': vendor_items_result.deleted_count
    }), 200

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
def delete_notifications():
    db = connect_to_mongo()
    data = request.get_json()
    notification_ids = data.get('ids', [])
    if not notification_ids:
        return jsonify({'error': 'No notification IDs provided'}), 400

    try:
        # Convert string IDs to ObjectId
        object_ids = [ObjectId(id) for id in notification_ids]
        result = db.Notifications.delete_many({'_id': {'$in': object_ids}})
        if result.deleted_count == 0:
            return jsonify({'error': 'No notifications found'}), 404
        return jsonify({'message': f'Deleted {result.deleted_count} notifications'}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to delete notifications', 'details': str(e)}), 500

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
