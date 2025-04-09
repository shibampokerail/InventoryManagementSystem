from flask import Flask
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv
from crud.create import (
    create_user, create_vendor, create_inventory_item, create_order,
    create_vendor_item, create_notification, create_log, create_inventory_usage
)
from crud.read import (
    get_users, get_vendors, get_orders, get_vendor_items,
    get_notifications, get_logs, get_inventory_usage, get_inventory_items
)
from crud.update import (
    update_user, update_vendor, update_inventory_item, update_order,
    update_vendor_item, update_notification, update_log, update_inventory_usage
)
from crud.delete import (
    delete_user, delete_vendor, delete_inventory_item, delete_order,
    delete_vendor_item, delete_notification, delete_log, delete_inventory_usage
)
from crud.utils import login
app = Flask(__name__)

# Load environment variables
load_dotenv()
SECRET_KEY = os.getenv('SECRET_KEY') 
# JWT Configuration
app.config['JWT_SECRET_KEY'] = SECRET_KEY
jwt = JWTManager(app)

app.route('/api/login', methods=['POST'])(login)
# Routes for Users
app.route('/api/users', methods=['POST'])(create_user)
app.route('/api/users', methods=['GET'])(get_users)
app.route('/api/users/<id>', methods=['PUT'])(update_user)
app.route('/api/users/<id>', methods=['DELETE'])(delete_user)

# Routes for Vendors
app.route('/api/vendors', methods=['POST'])(create_vendor)
app.route('/api/vendors', methods=['GET'])(get_vendors)
app.route('/api/vendors/<id>', methods=['PUT'])(update_vendor)
app.route('/api/vendors/<id>', methods=['DELETE'])(delete_vendor)

# Routes for Inventory Items
app.route('/api/inventory-items', methods=['POST'])(create_inventory_item)
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

# Routes for Notifications
app.route('/api/notifications', methods=['POST'])(create_notification)
app.route('/api/notifications', methods=['GET'])(get_notifications)
app.route('/api/notifications/<id>', methods=['PUT'])(update_notification)
app.route('/api/notifications/<id>', methods=['DELETE'])(delete_notification)

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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 
