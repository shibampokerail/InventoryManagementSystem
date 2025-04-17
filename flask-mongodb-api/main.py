import eventlet
eventlet.monkey_patch()
from flask import Flask, request
from flask_jwt_extended import JWTManager, decode_token
from flask_cors import CORS
import os
from dotenv import load_dotenv
from flask_socketio import SocketIO, emit, ConnectionRefusedError

from crud.create import (
    create_user, create_vendor, create_inventory_item, create_order,
    create_vendor_item, create_notification, create_log, create_inventory_usage, create_slack_management
)
from crud.read import (
    get_users, get_vendors, get_orders, get_vendor_items,
    get_notifications, get_logs, get_inventory_usage, get_inventory_items, get_user,
    get_vendor, get_items_by_vendor, get_inventory_item, get_vendor_item, get_usage_by_item, get_slack_management,
    get_current_user
)
from crud.update import (
    update_user, update_vendor, update_inventory_item, update_order,
    update_vendor_item, update_notification, update_log, update_inventory_usage, update_slack_management, mark_notifications_read
)
from crud.delete import (
    delete_user, delete_vendor, delete_inventory_item, delete_order,
    delete_vendor_item, delete_notifications, delete_log, delete_inventory_usage
)
from crud.utils import login, logout, get_stats, start_watching_collections



app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://192.168.0.40:3006", "http://localhost:3006"]}})
# Load environment variables
load_dotenv()
SECRET_KEY = os.getenv('SECRET_KEY') 
# JWT Configuration
app.config['JWT_SECRET_KEY'] = SECRET_KEY

# Initialize SocketIO with eventlet
socketio = SocketIO(app, async_mode="eventlet", cors_allowed_origins=["http://192.168.0.40:3006", "http://localhost:3006"])
jwt = JWTManager(app)

# Start watching collections for real-time updates
start_watching_collections(socketio)

# WebSocket connection handlers
@socketio.on("connect", namespace="/realtime")
def handle_connect():
    token = request.args.get("token")
    if not token:
        print("WebSocket connection rejected: No token provided")
        raise ConnectionRefusedError("No token provided")
    try:
        decode_token(token)
        print("Client connected to /realtime namespace")
        emit("connection_status", {"status": "connected"}, namespace="/realtime")
    except Exception as e:
        print(f"WebSocket connection rejected: Invalid token - {str(e)}")
        raise ConnectionRefusedError(f"Invalid token: {str(e)}")

@socketio.on("disconnect", namespace="/realtime")
def handle_disconnect():
    print("Client disconnected from /realtime namespace")




app.route('/api/login', methods=['POST'])(login)

app.route('/api/logout', methods=['POST'])(logout)  # Added logout
# Stats Route
app.route('/api/stats', methods=['GET'])(get_stats)  # Added stats

# Routes for Users
app.route('/api/users', methods=['POST'])(create_user)
app.route('/api/users', methods=['GET'])(get_users)
app.route('/api/users/<id>', methods=['PUT'])(update_user)
app.route('/api/users/<id>', methods=['DELETE'])(delete_user)
app.route('/api/users/<id>', methods=['GET'])(get_user)  # Added
app.route('/api/users/me', methods=['GET'])(get_current_user)  # Added

# Routes for Vendors
app.route('/api/vendors', methods=['POST'])(create_vendor)
app.route('/api/vendors', methods=['GET'])(get_vendors)
app.route('/api/vendors/<id>', methods=['PUT'])(update_vendor)
app.route('/api/vendors/<id>', methods=['DELETE'])(delete_vendor)
app.route('/api/vendors/<vendor_id>', methods=['GET'])(get_vendor)  # Added
app.route('/api/vendors/<vendor_id>/items', methods=['GET'])(get_items_by_vendor)  # Added

# Routes for Inventory Items
app.route('/api/inventory-items', methods=['POST'])(create_inventory_item)
app.route('/api/inventory-items/<item_id>', methods=['GET'])(get_inventory_item)  # Added
app.route('/api/inventory-items', methods=['GET'])(get_inventory_items)
app.route('/api/inventory-items/<id>', methods=['PUT'])(update_inventory_item)
app.route('/api/inventory-items/<id>', methods=['DELETE'])(delete_inventory_item)

# Routes for Orders
app.route('/api/orders', methods=['POST'])(create_order)
app.route('/api/orders', methods=['GET'])(get_orders)
app.route('/api/orders/<id>', methods=['PUT'])(update_order)
app.route('/api/orders/<id>', methods=['DELETE'])(delete_order)

# Routes for Vendor Items
app.route('/api/vendor-items', methods=['POST'])(create_vendor_item)
app.route('/api/vendor-items', methods=['GET'])(get_vendor_items)
app.route('/api/vendor-items/<id>', methods=['PUT'])(update_vendor_item)
app.route('/api/vendor-items/<id>', methods=['DELETE'])(delete_vendor_item)
app.route('/api/vendor-items/<vendor_item_id>', methods=['GET'])(get_vendor_item)  # Added

# Routes for Notifications
app.route('/api/notifications', methods=['POST'])(create_notification)
app.route('/api/notifications', methods=['GET'])(get_notifications)
app.route('/api/notifications/<id>', methods=['PUT'])(update_notification)
app.route('/api/notifications', methods=['DELETE'])(delete_notifications)
app.route('/api/notifications/mark-read', methods=['PUT'])(mark_notifications_read)  # Added

# Routes for Logs
app.route('/api/logs', methods=['POST'])(create_log)
app.route('/api/logs', methods=['GET'])(get_logs)
app.route('/api/logs/<id>', methods=['PUT'])(update_log)
app.route('/api/logs/<id>', methods=['DELETE'])(delete_log)

# Routes for Inventory Usage
app.route('/api/inventory-usage', methods=['POST'])(create_inventory_usage)
app.route('/api/inventory-usage', methods=['GET'])(get_inventory_usage)
app.route('/api/inventory-usage/<id>', methods=['PUT'])(update_inventory_usage)
app.route('/api/inventory-usage/<id>', methods=['DELETE'])(delete_inventory_usage)
app.route('/api/inventory-usage/item/<item_id>', methods=['GET'])(get_usage_by_item)  # Added


# Routes for Slack Management
app.route('/api/slack-management', methods=['POST'])(create_slack_management)
app.route('/api/slack-management', methods=['GET'])(get_slack_management)
app.route('/api/slack-management', methods=['PUT'])(update_slack_management)

if __name__ == '__main__':
    socketio.run(app, debug=False, host='0.0.0.0', port=5001) 
