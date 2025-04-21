from flask import jsonify, request
from flask_jwt_extended import jwt_required
from crud.utils import api_key_or_jwt_required, connect_to_mongo, require_role
from bson.objectid import ObjectId
from datetime import datetime
import logging

# Ensure logging is configured
logging.basicConfig(level=logging.INFO, filename='app.log', format='%(asctime)s [%(levelname)s] %(message)s')
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
@api_key_or_jwt_required()
def update_vendor(id):
    db = connect_to_mongo()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    update_data = {k: v for k, v in data.items() if k in ['name', 'contact', 'phone']}
    if not update_data:
        return jsonify({'error': 'No valid fields to update'}), 400

    result = db.Vendors.update_one({'_id': ObjectId(id)}, {'$set': update_data})
    if result.matched_count == 0:
        return jsonify({'error': 'Vendor not found'}), 404
    return jsonify({'message': 'Vendor updated successfully'}), 200

@api_key_or_jwt_required()
def update_inventory_item(id):
    db = connect_to_mongo()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    # Define fields that can be updated (excluding created_at)
    updatable_fields = ['name', 'category', 'quantity', 'minQuantity', 'unit', 'location', 'status', 'condition', 'description']
    update_data = {k: v for k, v in data.items() if k in updatable_fields}
    if not update_data:
        return jsonify({'error': 'No valid fields to update'}), 400

    # Type conversion and validation
    if 'quantity' in update_data:
        update_data['quantity'] = int(update_data['quantity'])
        if update_data['quantity'] < 0:
            return jsonify({'error': 'Quantity must be non-negative'}), 400
    if 'minQuantity' in update_data:
        update_data['minQuantity'] = int(update_data['minQuantity'])
        if update_data['minQuantity'] < 0:
            return jsonify({'error': 'minQuantity must be non-negative'}), 400
    
    # Add updated_at timestamp
    update_data['updated_at'] = datetime.utcnow()
    if int(update_data['quantity']) > int(update_data['minQuantity']):
        update_data['status'] = 'AVAILABLE'
    else:
        update_data['status'] = 'LOW STOCK'
    # Update the item in the database
    result = db.InventoryItems.update_one({'_id': ObjectId(id)}, {'$set': update_data})
    if result.matched_count == 0:
        return jsonify({'error': 'Inventory item not found'}), 404

    # Check if quantity is below minQuantity and create notification if necessary
    if 'quantity' in update_data or 'minQuantity' in update_data:
        updated_item = db.InventoryItems.find_one({'_id': ObjectId(id)})
        if updated_item and updated_item['quantity'] < updated_item['minQuantity']:
            notification = {
                'type': 'lowStock',
                'message': f"{updated_item['name']} quantity is below minimum threshold.",
                'timestamp': datetime.utcnow(),
                'recipient': 'general_channel',
                'read': False
            }
            # Insert notification into Notifications collection
            db.Notifications.insert_one(notification)
    return jsonify({'message': 'Inventory item updated successfully'}), 200

# Update an Order
@api_key_or_jwt_required()
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
    if update_data.get('status') == 'received':
        # Update inventory item quantity when order is received
        order = db.Orders.find_one({'_id': ObjectId(id)})
        if order:
            db.InventoryItems.update_one(
                {'_id': ObjectId(order['itemId'])},
                {'$inc': {'quantity': order['quantity']}}
            )
        # Update the status after increase
        inventory_item = db.InventoryItems.find_one({'_id': ObjectId(order['itemId'])})
        if inventory_item and inventory_item['quantity'] > inventory_item['minQuantity']:
            db.InventoryItems.update_one(
                {'_id': ObjectId(order['itemId'])},
                {'$set': {'status': 'AVAILABLE'}}
            )
    if result.matched_count == 0:
        return jsonify({'error': 'Order not found'}), 404
    return jsonify({'message': 'Order updated successfully'}), 200

# Update a Vendor-Item
@api_key_or_jwt_required()
def update_vendor_item(id):
    db = connect_to_mongo()
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    update_data = {k: v for k, v in data.items() if k in ['vendorId', 'itemId']}
    if not update_data:
        return jsonify({'error': 'No valid fields to update'}), 400
    
    result = db.VendorItems.update_one({'_id': ObjectId(id)}, {'$set': update_data})
    if result.matched_count == 0:
        return jsonify({'error': 'Vendor-item not found'}), 404
    return jsonify({'message': 'Vendor-item updated successfully'}), 200

# Update a Notification
@api_key_or_jwt_required()
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

@api_key_or_jwt_required()
def mark_notifications_read():
    db = connect_to_mongo()
    data = request.get_json()
    notification_ids = data.get('ids', [])
    if not notification_ids:
        return jsonify({'error': 'No notification IDs provided'}), 400

    try:
        # Convert string IDs to ObjectId
        object_ids = [ObjectId(id) for id in notification_ids]
        result = db.Notifications.update_many(
            {'_id': {'$in': object_ids}},
            {'$set': {'read': True, 'updated_at': datetime.utcnow()}}
        )
        if result.matched_count == 0:
            return jsonify({'error': 'No notifications found'}), 404
        return jsonify({'message': f'Marked {result.modified_count} notifications as read'}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to mark notifications as read', 'details': str(e)}), 500

# Update a Log
@api_key_or_jwt_required()
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
@api_key_or_jwt_required()
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


# Update Slack Management Configuration
@api_key_or_jwt_required()
@require_role('admin')  # Only admins can update the configuration
def update_slack_management():
    try:
        db = connect_to_mongo()
        if db is None:
            logging.error("Failed to connect to MongoDB")
            return jsonify({'error': 'Database connection failed'}), 500

        # Check if a document exists
        existing_config = db.SlackManagement.find_one()
        if not existing_config:
            return jsonify({'error': 'Slack management configuration not found. Create one first.'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        # Prepare update fields
        update_fields = {}
        if 'bot_token' in data:
            update_fields['bot_token'] = data['bot_token']
        if 'app_token' in data:
            update_fields['app_token'] = data['app_token']
        if 'user_token' in data:
            update_fields['user_token'] = data['user_token']
        if 'channel_ids' in data:
            update_fields['channel_ids'] = data['channel_ids']
        if 'webhook' in data:
            update_fields['webhook'] = data['webhook']
        update_fields['updated_at'] = datetime.utcnow().isoformat()

        # Update the document
        result = db.SlackManagement.update_one({}, {'$set': update_fields})
        if result.modified_count:
            updated_config = db.SlackManagement.find_one()
            updated_config['_id'] = str(updated_config['_id'])
            return jsonify(updated_config), 200
        return jsonify({'message': 'No changes made'}), 200

    except Exception as e:
        logging.error(f"Error updating slack management configuration: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred', 'details': str(e)}), 500
