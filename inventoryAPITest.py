import unittest
from InventoryAPI import InventoryAPIHandler  # Update to match your actual file/module name

class TestInventoryAPIHandler(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.api = InventoryAPIHandler(
            base_url="",  # Your actual API base URL
            token=""  # Replace with actual API key
        )

    def test_create_vendor(self):
        vendor_data = {
            "name": "Vendor Inc.",
            "contact": "vendor@example.com"
        }
        response = self.api.create_vendor(vendor_data)
        self.assertIn("_id", response)
        self.__class__.vendor_id = response["_id"]

    def test_create_inventory_item(self):
        item_data = {
            "name": "Item A",
            "quantity": 100,
            "location": "Warehouse 1",
            "minQuantity": 10,
            "description": "Test item for automated test",
            "unit": "pieces"
        }
        response = self.api.create_inventory_item(item_data)
        self.assertIn("_id", response)
        self.__class__.item_id = response["_id"]

    def test_get_inventory_items(self):
        response = self.api.get_inventory_items()
        self.assertIsInstance(response, list)

    def test_update_inventory_item(self):
        if not hasattr(self.__class__, '67ea3058ed52206fe0026820'):
            self.skipTest("Item not created")
        update_data = {"quantity": 100}
        response = self.api.update_inventory_item(self.__class__.item_id, update_data)
        self.assertNotIn("error", response)

    def test_delete_inventory_item(self):
        if not hasattr(self.__class__, 'item_id'):
            self.skipTest("Item not created")
        response = self.api.delete_inventory_item(self.__class__.item_id)
        self.assertNotIn("error", response)

    def test_create_order(self):
        if not hasattr(self.__class__, 'item_id') or not hasattr(self.__class__, 'vendor_id'):
            self.skipTest("Dependencies not created")

        order_data = {
            "itemId": self.__class__.item_id,
            "vendorId": self.__class__.vendor_id,
            "quantity": 10,
            "status": "pending"
        }
        response = self.api.create_order(order_data)
        self.assertIn("id", response)
        self.__class__.order_id = response["id"]

    def test_get_orders(self):
        response = self.api.get_orders()
        self.assertIsInstance(response, list)

    def test_update_order(self):
        if not hasattr(self.__class__, 'order_id'):
            self.skipTest("Order not created")
        update_data = {"status": "approved"}
        response = self.api.update_order(self.__class__.order_id, update_data)
        self.assertNotIn("error", response)

    def test_delete_order(self):
        if not hasattr(self.__class__, 'order_id'):
            self.skipTest("Order not created")
        response = self.api.delete_order(self.__class__.order_id)
        self.assertNotIn("error", response)

    def test_create_vendor_item(self):
        # Make sure item and vendor IDs exist
        if not hasattr(self.__class__, 'item_id') or not hasattr(self.__class__, 'vendor_id'):
            self.skipTest("Missing item_id or vendor_id")

        vendor_item_data = {
            "vendorId": self.__class__.vendor_id,  # snake_case
            "itemId": self.__class__.item_id,  # snake_case
            "price": 12.5
        }

        response = self.api.create_vendor_item(vendor_item_data)
        self.assertIn("_id", response)

    def test_get_vendor_items(self):
        response = self.api.get_vendor_items()
        self.assertIsInstance(response, list)

    def test_create_notification(self):
        notification_data = {
            "message": "New notification message",
            "level": "info"
        }
        response = self.api.create_notification(notification_data)
        self.assertIn("_id", response)
        self.__class__.notification_id = response["_id"]

    def test_get_notifications(self):
        response = self.api.get_notifications()
        self.assertIsInstance(response, list)

    def test_get_logs(self):
        response = self.api.get_logs()
        self.assertIsInstance(response, list)

    def test_record_inventory_usage(self):
        usage_data = {
  "itemId": "67ea3058ed52206fe0026820",
  "userId": "67ff67be5133a46e03b3d35e",
  "quantity": 5,
  "action": "checkout",
            "timestamp": "Thu, 25 Oct 2023 00:00:00 GMT"
}
        response = self.api.record_inventory_usage(usage_data)
        self.assertIn("_id", response)

    def test_get_inventory_usage_logs(self):
        response = self.api.get_inventory_usage_logs()
        self.assertIsInstance(response, list)


if __name__ == '__main__':
    unittest.main()
