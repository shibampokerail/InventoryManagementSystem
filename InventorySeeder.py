import random
import requests


class InventorySeeder:
    def __init__(self, base_url, token):
        self.api_url = f"{base_url}/inventory-usage"
        self.headers = {
            "X-API-Key": f"{token}",
            "Content-Type": "application/json"
        }
        self.user_ids = [
            "67eb44d033f26692da8799dd",
            "67ff67be5133a46e03b3d35e",
            "68009721e067ab73e0b05a56"
        ]
        self.item_ids = [
            "67ea3058ed52206fe0026820",
            "67ff4caf04f8084d18b3c416",
            "67ff4d5c7abdcdd7545bdc53",
            "67ff54445e6693be0362532a",
            "67ff54805e6693be0362532b",
            "68008513f2346f641ba65357",
            "68013ba2586f18dda9957538"
        ]

    def populate_usage_logs(self, count=10):
        success_count = 0

        # Step 1: Get inventory items from the API
        inventory_response = requests.get(f"{self.api_url}/../inventory-items", headers=self.headers)
        if inventory_response.status_code != 200:
            print(f"❌ Failed to fetch inventory items: {inventory_response.status_code}")
            return

        inventory_items = inventory_response.json()

        # Step 2: Categorize items
        consumable_items = [item for item in inventory_items if item["category"] == "Supplies"]
        reusable_items = [
            item for item in inventory_items
            if item["category"] in ["Office Supplies", "Furniture"]
        ]

        if not (consumable_items or reusable_items):
            print("⚠️ No items found to populate logs.")
            return

        # Step 3: Create usage logs
        for _ in range(count):
            user_id = random.choice(self.user_ids)

            # Randomly choose between creating a consumable or reusable record
            if consumable_items and random.choice([True, False]):
                item = random.choice(consumable_items)
                payload = {
                    "itemId": item["_id"],
                    "userId": user_id,
                    "quantity": random.randint(1, 10),
                    "action": "used"
                }
                response = requests.post(self.api_url, json=payload, headers=self.headers)
                if response.status_code in [200, 201]:
                    success_count += 1
                else:
                    print(f"❌ Failed to log consumable usage: {response.status_code} - {response.text}")
            elif reusable_items:
                item = random.choice(reusable_items)
                quantity = random.randint(1, 5)

                # Step 1: Checkout
                checkout_payload = {
                    "itemId": item["_id"],
                    "userId": user_id,
                    "quantity": quantity,
                    "action": "checkout"
                }
                checkout_response = requests.post(self.api_url, json=checkout_payload, headers=self.headers)
                if checkout_response.status_code in [200, 201]:
                    success_count += 1
                else:
                    print(f"❌ Failed to log checkout: {checkout_response.status_code} - {checkout_response.text}")
                    continue

                # Step 2: Return or mark issue
                follow_up_action = random.choice(["return", "damaged", "missing", "other-issue"])
                follow_up_payload = {
                    "itemId": item["_id"],
                    "userId": user_id,
                    "quantity": quantity,
                    "action": follow_up_action
                }
                follow_up_response = requests.post(self.api_url, json=follow_up_payload, headers=self.headers)
                if follow_up_response.status_code in [200, 201]:
                    success_count += 1
                else:
                    print(
                        f"❌ Failed to log follow-up ({follow_up_action}): {follow_up_response.status_code} - {follow_up_response.text}")

        print(f"✅ {success_count} usage records created successfully.")

    def delete_all_usage_logs(self):
        response = requests.get(self.api_url, headers=self.headers)
        if response.status_code != 200:
            print(f"❌ Failed to fetch usage logs: {response.status_code} - {response.text}")
            return

        logs = response.json()
        if not logs:
            print("ℹ️ No usage logs to delete.")
            return

        print(f"🗑 Deleting {len(logs)} usage records...")

        deleted_count = 0
        for log in logs:
            log_id = log.get("_id")
            if not log_id:
                continue

            delete_response = requests.delete(f"{self.api_url}/{log_id}", headers=self.headers)
            if delete_response.status_code == 200:
                deleted_count += 1
            else:
                print(f"⚠️ Failed to delete {log_id}: {delete_response.status_code} - {delete_response.text}")

        print(f"✅ Deleted {deleted_count}/{len(logs)} usage logs.")


seeder = InventorySeeder(
    base_url="",
    token=""
)

seeder.populate_usage_logs(count=20)
# seeder.delete_all_usage_logs()