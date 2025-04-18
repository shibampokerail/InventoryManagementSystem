import requests
import json



class InventoryAPIHandler:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {
            "X-API-Key": f"{token}",
            "Content-Type": "application/json"
        }

    # --------- USERS ---------
    def create_user(self, user_data):
        """Create a new user (Admin only)"""
        url = f"{self.base_url}/api/users"
        return self._post(url, user_data)

    def get_users(self):
        """Create a new user (Admin only)"""
        url = f"{self.base_url}/api/users"
        return self._get(url)

    # --------- VENDORS ---------
    def create_vendor(self, vendor_data):
        """Create a new vendor"""
        url = f"{self.base_url}/api/vendors"
        return self._post(url, vendor_data)

    # --------- INVENTORY ITEMS ---------
    def create_inventory_item(self, item_data):
        """Add a new inventory item"""
        url = f"{self.base_url}/api/inventory-items"
        return self._post(url, item_data)

    def get_inventory_items(self):
        """Get all inventory items - slack"""
        url = f"{self.base_url}/api/inventory-items"
        return self._get(url)

    def get_inventory_item(self, name="default", id=""):
        """Get all inventory items - slack"""
        if name=="default":
            url = f"{self.base_url}/api/inventory-items?name="+name
        else:
            url = f"{self.base_url}/api/inventory-items/?id="+id
        return self._get(url)

    def update_inventory_item(self, item_id, update_data):
        """Update an inventory item - slack"""
        url = f"{self.base_url}/api/inventory-items/{item_id}"
        return self._put(url, update_data)

    def delete_inventory_item(self, item_id):
        """Delete an inventory item"""
        url = f"{self.base_url}/api/inventory-items/{item_id}"
        return self._delete(url)

    # --------- ORDERS ---------
    def create_order(self, order_data):
        """Create a new order"""
        url = f"{self.base_url}/api/orders"
        return self._post(url, order_data)

    def get_orders(self):
        """Get all orders"""
        url = f"{self.base_url}/api/orders"
        return self._get(url)

    def update_order(self, order_id, update_data):
        """Update an order"""
        url = f"{self.base_url}/api/orders/{order_id}"
        return self._put(url, update_data)

    def delete_order(self, order_id):
        """Delete an order"""
        url = f"{self.base_url}/api/orders/{order_id}"
        return self._delete(url)

    # --------- VENDOR ITEMS ---------
    def create_vendor_item(self, vendor_item_data):
        """Create a vendor item"""
        url = f"{self.base_url}/api/vendor-items"
        return self._post(url, vendor_item_data)

    def get_vendor_items(self):
        """Get all vendor items - slack"""
        url = f"{self.base_url}/api/vendor-items"
        return self._get(url)

    def get_vendors(self):
        """Get all vendor items - slack"""
        url = f"{self.base_url}/api/vendors"
        return self._get(url)

    # --------- NOTIFICATIONS ---------
    def create_notification(self, notification_data):
        """Create a notification """

        url = f"{self.base_url}/api/notifications"
        return self._post(url, notification_data)

    def get_notifications(self):
        """Get notifications - slack"""
        url = f"{self.base_url}/api/notifications"
        return self._get(url)

    # --------- LOGS ---------
    def get_logs(self):
        """Get system logs - slack"""
        url = f"{self.base_url}/api/logs"
        return self._get(url)

    # --------- INVENTORY USAGE ---------
    def record_inventory_usage(self, usage_data):
        """Record inventory usage"""
        url = f"{self.base_url}/api/inventory-usage"
        return self._post(url, usage_data)

    def get_inventory_usage_logs(self):
        """Get inventory usage logs"""
        url = f"{self.base_url}/api/inventory-usage"
        return self._get(url)

    # --------- INTERNAL HELPERS ---------
    def _post(self, url, data):
        response = requests.post(url, headers=self.headers, data=json.dumps(data))
        return self._handle_response(response)

    def _get(self, url):
        response = requests.get(url, headers=self.headers)
        return self._handle_response(response)

    def _put(self, url, data):
        response = requests.put(url, headers=self.headers, data=json.dumps(data))
        return self._handle_response(response)

    def _delete(self, url):
        response = requests.delete(url, headers=self.headers)
        return self._handle_response(response)

    def _handle_response(self, response):
        try:
            response.raise_for_status()
            if response.text:
                return response.json()
            else:
                return {"status": "success"}
        except requests.exceptions.HTTPError as err:
            return {"error": str(err), "status_code": response.status_code, "response": response.text}

if __name__=="__main__":
    api = InventoryAPIHandler(
        base_url="",
        token=""
    )
    print(api.get_inventory_usage_logs())
