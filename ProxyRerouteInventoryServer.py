from flask import Flask, request, jsonify
from flask_cors import CORS
from InventoryAPI import InventoryAPIHandler  # Make sure the filename is correct

app = Flask(__name__)
CORS(app)  # Allow CORS for all domains

# Initialize your API wrapper
api = InventoryAPIHandler(
    base_url="",
    token=""
)

# Health check
@app.route("/")
def home():
    return jsonify({"status": "OK", "message": "Inventory Usage API is live!"})

# Get all inventory usage logs
@app.route("/inventory-usage", methods=["GET"])
def get_inventory_usage():
    result = api.get_inventory_usage_logs()
    return jsonify(result)

# Record new inventory usage
@app.route("/inventory-usage", methods=["POST"])
def create_inventory_usage():
    data = request.get_json()
    result = api.record_inventory_usage(data)
    return jsonify(result)

# Get all inventory items
@app.route("/inventory-items", methods=["GET"])
def get_inventory_items():
    result = api.get_inventory_items()
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True, port=5002)
