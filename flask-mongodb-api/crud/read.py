from flask import jsonify
from flask_jwt_extended import jwt_required
from crud.utils import connect_to_mongo, api_key_or_jwt_required
from bson.objectid import ObjectId

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

# Get all orders
@api_key_or_jwt_required()
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

# Get all notifications
@api_key_or_jwt_required()
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
    try:
        items = list(db.InventoryItems.find())
        for item in items:
            item['_id'] = str(item['_id'])
        return jsonify(items)
    except Exception as e:
        return jsonify({'error': 'Failed to fetch inventory items'}), 500
