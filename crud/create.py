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
        'phone': data.get('phone', ''),
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
        'description': data.get('description', ''),  # Default to empty string if not provided
    }

    # Validate required fields
    missing_fields = [field for field in required_fields if not new_item[field]]
    if missing_fields:
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

    # Validate quantity and minQuantity to be non-negative
    if new_item['quantity'] < 0 or new_item['minQuantity'] < 0:
        return jsonify({'error': 'Quantity and minQuantity must be non-negative'}), 400
    if new_item['quantity'] < new_item['minQuantity']:
        new_item['status'] = 'LOW STOCK'  # Set status to LOW if quantity is less than minQuantity
    # Insert into the database
    result = db.InventoryItems.insert_one(new_item)
    new_item['_id'] = str(result.inserted_id)
    return jsonify(new_item), 201

# Create an Order
@api_key_or_jwt_required()
def create_order():
    db = connect_to_mongo()
    data = request.get_json()
    required_fields = ['itemId', 'vendorId', 'quantity', 'orderDate', 'expectedDelivery', 'status']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        order = {
            'itemId': ObjectId(data['itemId']),
            'vendorId': ObjectId(data['vendorId']),
            'quantity': int(data['quantity']),
            'orderDate': datetime.fromisoformat(data['orderDate'].replace('Z', '+00:00')),
            'expectedDelivery': datetime.fromisoformat(data['expectedDelivery'].replace('Z', '+00:00')),
            'status': data['status'],
            'created_at': datetime.utcnow()
        }
        result = db.Orders.insert_one(order)
        if order['status'] == 'received':
            # Update inventory item quantity if order is received
            db.InventoryItems.update_one({'_id': order['itemId']}, {'$inc': {'quantity': order['quantity']}})
                # Update the status after increase
        inventory_item = db.InventoryItems.find_one({'_id': ObjectId(order['itemId'])})
        if inventory_item and inventory_item['quantity'] > inventory_item['minQuantity']:
            db.InventoryItems.update_one(
                {'_id': ObjectId(order['itemId'])},
                {'$set': {'status': 'AVAILABLE'}}
            )
        return jsonify({'message': 'Order created', 'id': str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({'error': 'Failed to create order', 'details': str(e)}), 500
# Create a Vendor-Item
@api_key_or_jwt_required()
def create_vendor_item():
    db = connect_to_mongo()
    data = request.get_json()
    if not data or not all(key in data for key in ['vendorId', 'itemId']):
        return jsonify({'error': 'Missing required fields: vendorId, itemId'}), 400

    new_vendor_item = {
        'vendorId': ObjectId(data['vendorId']),
        'itemId': ObjectId(data['itemId']),
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
        'created_at': datetime.utcnow(),
        'recipient': data.get('recipient', 'all'),  # Default to 'all' if not provided
        'type': data.get('type', 'info'),  # Default to 'info' if not provided
        'read': data.get('read', False),  # Default to False if not provided
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

    # Validate required fields
    required_fields = ["itemId", "userId", "quantity", "action"]
    if not data or not all(key in data for key in required_fields):
        return jsonify({"error": f"Missing required fields: {', '.join(required_fields)}"}), 400

    quantity = int(data["quantity"])
    action = data["action"]

    # Validate ObjectId fields
    try:
        item_id = ObjectId(data["itemId"])
        user_id = ObjectId(data["userId"])
    except Exception as e:
        return jsonify({"error": "Invalid itemId or userId format"}), 400

    # Validate quantity
    if quantity <= 0:
        return jsonify({"error": "Quantity must be a positive integer"}), 400

    # Define actions that decrease or increase inventory
    decrease_actions = ["reportedDamaged", "reportedStolen", "reportedLost", "reportedCheckedOut", 'daily-usages']
    increase_actions = ["reportedReturned"]

    # Check if the action affects inventory
    if action in decrease_actions or action in increase_actions:
        # Fetch the current item from the inventory
        item = db.InventoryItems.find_one({"_id": item_id})
        if not item:
            return jsonify({"error": "Item not found"}), 404

        current_quantity = item.get("quantity", 0)
        new_quantity = current_quantity

        if action in decrease_actions:
            # Decrease inventory quantity
            new_quantity = current_quantity - quantity
            if new_quantity < 0:
                return jsonify({
                    "error": f"Insufficient quantity for {item.get('name', 'item')}. Current: {current_quantity}, Requested: {quantity}"
                }), 400
        elif action in increase_actions:
            # Increase inventory quantity
            new_quantity = current_quantity + quantity

        # Update the inventory item quantity
        status = "AVAILABLE"
        if new_quantity < item.get("minQuantity", 0):
            status = "LOW STOCK"
        update_result = db.InventoryItems.update_one(
            {"_id": item_id},
            {"$set": {
                "quantity": new_quantity,
                "updated_at": datetime.utcnow(),
                "status": status
            }}
        )

        if update_result.modified_count == 0:
            return jsonify({"error": "Failed to update inventory quantity"}), 500

    # Create the new inventory usage record
    new_usage = {
        "itemId": item_id,
        "userId": user_id,
        "quantity": quantity,
        "action": action,
        "timestamp": datetime.utcnow()
    }

    # Insert into the database
    result = db.InventoryUsage.insert_one(new_usage)

    return jsonify({
        "message": "Inventory usage recorded successfully",
        "usageId": str(result.inserted_id)
    }), 201


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
    if not data or not all(key in data for key in ['bot_token', 'app_token', 'user_token', 'webhook']):
        return jsonify({'error': 'Missing required fields: bot_token, app_token, user_token'}), 400

    # Channel IDs are optional; default to empty list if not provided
    channel_ids = data.get('channel_ids', [])

    new_config = {
        'bot_token': data['bot_token'],
        'app_token': data['app_token'],
        'user_token': data['user_token'],
        'webhook': data['webhook'],
        'channel_ids': channel_ids,
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat()
    }

    result = db.SlackManagement.insert_one(new_config)
    new_config['_id'] = str(result.inserted_id)
    return jsonify(new_config), 201
