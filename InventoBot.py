import requests
import json
import re
import os
from datetime import datetime, timedelta

from slack_sdk import WebClient
from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler

# Import Gemini API
from google import genai
from google.genai import types


# InventoryAPIHandler Class for Inventory API interactions
class InventoryAPIHandler:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {
            "X-API-Key": f"{token}",
            "Content-Type": "application/json"
        }

    def get_inventory_items(self):
        """Get all inventory items"""
        url = f"{self.base_url}/api/inventory-items"
        return self._get(url)

    def get_inventory_item(self, name):
        """Get inventory item by name"""
        url = f"{self.base_url}/api/inventory-items?name={name}"
        return self._get(url)

    def update_inventory_item(self, item_id, update_data):
        """Update an inventory item"""
        url = f"{self.base_url}/api/inventory-items/{item_id}"
        return self._put(url, update_data)

    def get_notifications(self):
        """Get notifications"""
        url = f"{self.base_url}/api/notifications"
        return self._get(url)

    def get_inventory_usage_logs(self):
        """Get inventory usage logs"""
        url = f"{self.base_url}/api/inventoryusage"
        return self._get(url)

    def get_orders(self):
        """Get all orders"""
        url = f"{self.base_url}/api/orders"
        return self._get(url)

    def record_inventory_usage(self, usage_data):
        """Record inventory usage"""
        url = f"{self.base_url}/api/inventoryusage"
        return self._post(url, usage_data)

    # Internal helper methods for API requests
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


# BotWebAPI Class for Web API interactions
class BotWebAPI:
    def __init__(self, bot_token):
        self.bot_token = bot_token
        self.headers = {
            'Authorization': f'Bearer {self.bot_token}',
            'Content-Type': 'application/json'
        }
        self.client = WebClient(token=bot_token)

    def post_message(self, message="Hello! This is a test...", channel_id='C08KG5C89AQ'):
        url = 'https://slack.com/api/chat.postMessage'
        payload = {'channel': channel_id, 'text': message}
        response = requests.post(url, headers=self.headers, data=json.dumps(payload))

        if response.status_code == 200:
            data = response.json()
            if data.get('ok'):
                print('Message posted successfully.')
            else:
                print(f"Error posting message: {data.get('error')}")
        else:
            print(f"HTTP error: {response.status_code}")

    def join_channel(self, channel_id):
        url = 'https://slack.com/api/conversations.join'
        payload = {'channel': channel_id}
        response = requests.post(url, headers=self.headers, data=json.dumps(payload))

        if response.status_code == 200:
            data = response.json()
            if data.get('ok'):
                print(f"Bot joined channel {channel_id}.")
            else:
                print(f"Error joining channel: {data.get('error')}")
        else:
            print(f"HTTP error: {response.status_code}")

    def set_reminder(self, user_id, reminder_text, reminder_time):
        try:
            response = self.client.reminders_add(
                text=reminder_text,
                time=reminder_time,
                user=user_id
            )
            if response['ok']:
                print(f"Reminder set for {user_id}!")
            else:
                print(f"Error setting reminder: {response['error']}")
        except Exception as e:
            print(f"Error calling Slack API: {str(e)}")


# GeminiHandler Class for AI-powered responses
class GeminiHandler:
    def __init__(self, api_key, inventory_api_handler):
        self.client = genai.Client(api_key=api_key)
        self.inventory_api_handler = inventory_api_handler

        # Function declarations for Gemini
        self.function_declarations = [
            {
                "name": "get_inventory_items",
                "description": "Gets all inventory items",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            },
            {
                "name": "get_inventory_item",
                "description": "Gets a specific inventory item by name",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "description": "The name of the inventory item to retrieve",
                        }
                    },
                    "required": ["name"]
                }
            },
            {
                "name": "update_inventory_usage",
                "description": "Records usage of an inventory item (e.g., when items are used or taken)",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "item_name": {
                            "type": "string",
                            "description": "The name of the inventory item used"
                        },
                        "quantity": {
                            "type": "integer",
                            "description": "The quantity used"
                        },
                        "user_id": {
                            "type": "string",
                            "description": "ID of the user who used the item"
                        }
                    },
                    "required": ["item_name", "quantity", "user_id"]
                }
            },
            {
                "name": "restock_inventory",
                "description": "Records restocking of an inventory item",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "item_name": {
                            "type": "string",
                            "description": "The name of the inventory item restocked"
                        },
                        "quantity": {
                            "type": "integer",
                            "description": "The quantity added to inventory"
                        },
                        "user_id": {
                            "type": "string",
                            "description": "ID of the user who restocked the item"
                        }
                    },
                    "required": ["item_name", "quantity", "user_id"]
                }
            },
            {
                "name": "get_notifications",
                "description": "Gets system notifications",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            },
            {
                "name": "get_inventory_usage_logs",
                "description": "Gets inventory usage logs",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            },
            {
                "name": "get_orders",
                "description": "Gets all orders",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                }
            }
        ]

    def process_message(self, message_text, user_id):
        """Process a natural language message using Gemini"""
        # Configure the client and tools
        tools = types.Tool(function_declarations=self.function_declarations)
        config = types.GenerateContentConfig(tools=[tools])

        try:
            # Send request to Gemini with function declarations
            response = self.client.models.generate_content(
                model="gemini-2.0-flash",
                contents=message_text,
                config=config,
            )

            # Check for a function call
            if response.candidates[0].content.parts[0].function_call:
                function_call = response.candidates[0].content.parts[0].function_call
                function_name = function_call.name
                function_args = function_call.args

                # Execute the appropriate function based on the function call
                result = self._execute_function(function_name, function_args, user_id)

                # Generate a user-friendly response based on the function result
                follow_up_response = self.client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=[
                        "The user asked: " + message_text,
                        "Function called: " + function_name,
                        "Function result: " + json.dumps(result),
                        "Please provide a helpful, conversational response based on this information."
                    ]
                )

                return follow_up_response.text
            else:
                # If no function call was needed, return the direct response
                return response.text

        except Exception as e:
            print(f"Error processing with Gemini: {str(e)}")
            return f"I'm sorry, I encountered an error while processing your request. Please try again or use a command directly."

    def _execute_function(self, function_name, args, user_id):
        """Execute the appropriate function based on the function call from Gemini"""
        if function_name == "get_inventory_items":
            return self.inventory_api_handler.get_inventory_items()

        elif function_name == "get_inventory_item":
            return self.inventory_api_handler.get_inventory_item(args.get("name", ""))

        elif function_name == "update_inventory_usage":
            item_name = args.get("item_name", "")
            quantity = args.get("quantity", 0)

            # Get the item ID first
            api_item = self.inventory_api_handler.get_inventory_item(item_name)

            if api_item and not "error" in api_item:
                item_data = api_item[0] if isinstance(api_item, list) else api_item
                item_id = item_data.get('id')
                current_quantity = item_data.get('quantity', 0)
                min_stock = item_data.get('minStockLevel', 0)

                new_quantity = max(0, current_quantity - quantity)
                update_data = {"quantity": new_quantity}

                # Record usage in API
                usage_data = {
                    "itemId": item_id,
                    "quantity": quantity,
                    "userId": user_id,
                    "timestamp": datetime.now().isoformat()
                }
                self.inventory_api_handler.record_inventory_usage(usage_data)

                # Update the item in API
                self.inventory_api_handler.update_inventory_item(item_id, update_data)

                return {
                    "status": "success",
                    "item": item_name,
                    "quantity_used": quantity,
                    "remaining": new_quantity,
                    "low_stock": new_quantity <= min_stock,
                    "out_of_stock": new_quantity <= 0
                }
            else:
                return {"error": f"Item '{item_name}' not found in inventory"}

        elif function_name == "restock_inventory":
            item_name = args.get("item_name", "")
            quantity = args.get("quantity", 0)

            # Get the item ID first
            api_item = self.inventory_api_handler.get_inventory_item(item_name)

            if api_item and not "error" in api_item:
                item_data = api_item[0] if isinstance(api_item, list) else api_item
                item_id = item_data.get('id')
                current_quantity = item_data.get('quantity', 0)

                new_quantity = current_quantity + quantity
                update_data = {"quantity": new_quantity}

                # Update the item in API
                self.inventory_api_handler.update_inventory_item(item_id, update_data)

                return {
                    "status": "success",
                    "item": item_name,
                    "quantity_added": quantity,
                    "new_total": new_quantity
                }
            else:
                return {"error": f"Item '{item_name}' not found in inventory"}

        elif function_name == "get_notifications":
            return self.inventory_api_handler.get_notifications()

        elif function_name == "get_inventory_usage_logs":
            return self.inventory_api_handler.get_inventory_usage_logs()

        elif function_name == "get_orders":
            return self.inventory_api_handler.get_orders()

        else:
            return {"error": f"Unknown function: {function_name}"}


# BotBolt Class for Slack Bot Operations
class BotBolt:
    def __init__(self, bot_token, app_token, api_base_url, api_token, gemini_api_key=None):
        self.app = App(token=bot_token)
        self.app_token = app_token
        self.bot_token = bot_token
        self.client = WebClient(token=bot_token)
        self.api_handler = InventoryAPIHandler(api_base_url, api_token)

        # AI mode flag
        self.ai_mode_enabled = gemini_api_key is not None

        # Initialize Gemini handler if API key is provided
        if self.ai_mode_enabled:
            self.gemini_handler = GeminiHandler(gemini_api_key, self.api_handler)

        # Legacy inventory tracking (to be replaced with API calls)
        self.inventory = {
            "paper towels": 10,
            "packs of liquid soap": 5,
            "toilet paper": 12
        }
        self.manager_id = "U08KC6YB4N7"
        self.logs_channel = self.get_or_create_logs_channel("manager-logs")
        self.shift_requests = {}

    def listener(self):
        @self.app.event("message")
        def handle_message_events(event, say):
            text = event.get("text", "").lower()
            user_id = event.get("user")
            channel = event.get("channel")
            ts = event.get("ts")

            if user_id and text:
                # Process shift requests
                if self.detect_shift_request(text):
                    self.log_shift_request(user_id, text, ts)
                elif self.detect_shift_acceptance(text, user_id):
                    self.confirm_shift_coverage(user_id, text)

                # Process commands - AI mode vs. regular mode
                if self.ai_mode_enabled and not text.startswith("!"):
                    # Process with Gemini AI
                    response = self.gemini_handler.process_message(text, user_id)
                    say(response)
                else:
                    # Process using traditional command parsing
                    if text.startswith("!"):
                        self.handle_command(say, channel, text, user_id)
                    elif "show inventory" in text or "how many" in text:
                        self.show_inventory(say, channel, text)
                    else:
                        item, quantity, action = self.extract_inventory_data(text)
                        if item and quantity:
                            if action in ["replenished", "restocked", "refilled"]:
                                self.refill_inventory(say, channel, item, quantity, user_id)
                            else:
                                self.update_inventory(say, channel, item, quantity, user_id)

        @self.app.event("reaction_added")
        def handle_reaction(event):
            if event["reaction"] == "white_check_mark":
                message_ts = event["item"]["ts"]
                covering_user = event["user"]
                self.handle_reaction_shift_coverage(covering_user, message_ts)

        handler = SocketModeHandler(self.app, self.app_token)
        handler.start()

    def handle_command(self, say, channel, text, user_id):
        """Process commands prefixed with !"""
        command_parts = text[1:].strip().split()
        if not command_parts:
            return

        command = command_parts[0].lower()
        args = command_parts[1:] if len(command_parts) > 1 else []

        # Command handlers
        if command in ["item", "getitem"]:
            self.cmd_get_item(say, args)
        elif command in ["updateitem", "update"]:
            self.cmd_update_item(say, args, user_id)
        elif command == "notifications":
            self.cmd_get_notifications(say)
        elif command == "usage":
            self.cmd_get_usage_logs(say)
        elif command == "orders":
            self.cmd_get_orders(say)
        elif command == "help":
            self.cmd_show_help(say)
        elif command == "aimode":
            # New command to toggle AI mode
            if args and args[0].lower() in ["on", "off"]:
                self.toggle_ai_mode(say, args[0].lower() == "on")
            else:
                say("Usage: `!aimode [on|off]` - Toggle AI-powered responses")
        else:
            say(f"Unknown command: `{command}`. Type `!help` for available commands.")

    def toggle_ai_mode(self, say, enable):
        """Toggle AI mode on/off if Gemini API key is available"""
        if enable and not self.ai_mode_enabled and not hasattr(self, 'gemini_handler'):
            say("Cannot enable AI mode: Gemini API key not configured.")
        else:
            self.ai_mode_enabled = enable
            status = "enabled" if enable else "disabled"
            say(f"AI-powered responses are now {status}.")

    def cmd_get_item(self, say, args):
        """Handle !item command"""
        if not args:
            say("Please provide an item name. Usage: `!item [name]`")
            return

        item_name = " ".join(args)
        response = self.api_handler.get_inventory_item(item_name)

        if "error" in response:
            say(f"Error getting item: {response.get('error')}")
            return

        if not response:
            say(f"No item found with name: {item_name}")
            return

        # Format the response
        items = response if isinstance(response, list) else [response]
        result = "*Inventory Items:*\n"
        for item in items:
            result += f"• *{item.get('name')}* (ID: {item.get('id')})\n"
            result += f"  Quantity: {item.get('quantity')}\n"
            result += f"  Min Stock: {item.get('minStockLevel')}\n"
            result += f"  Category: {item.get('category')}\n\n"

        say(result)

    def cmd_update_item(self, say, args, user_id):
        """Handle !updateitem command"""
        if len(args) < 3:
            say("Usage: `!updateitem [item_id] [field] [value]`\nExample: `!updateitem 123 quantity 50`")
            return

        item_id = args[0]
        field = args[1].lower()
        value = " ".join(args[2:])

        # Convert value to appropriate type
        if field in ["quantity", "minStockLevel"]:
            try:
                value = int(value)
            except ValueError:
                say(f"Invalid value for {field}. Please provide a number.")
                return

        # Prepare update data
        update_data = {field: value}

        # Call API
        response = self.api_handler.update_inventory_item(item_id, update_data)

        if "error" in response:
            say(f"Error updating item: {response.get('error')}")
            return

        say(f"✅ Successfully updated item {item_id}. Field '{field}' set to '{value}'.")
        self.log_action(user_id, f"Updated item {item_id}: {field}={value}")

    def cmd_get_notifications(self, say):
        """Handle !notifications command"""
        response = self.api_handler.get_notifications()

        if "error" in response:
            say(f"Error getting notifications: {response.get('error')}")
            return

        if not response:
            say("No notifications found.")
            return

        # Format the response
        notifications = response if isinstance(response, list) else [response]
        result = "*Recent Notifications:*\n"
        for notification in notifications[:10]:  # Show the 10 most recent
            date = notification.get('createdAt', 'N/A')
            message = notification.get('message', 'No message')
            level = notification.get('level', 'info').upper()
            result += f"• [{level}] {date}: {message}\n"

        say(result)

    def cmd_get_usage_logs(self, say):
        """Handle !usage command"""
        response = self.api_handler.get_inventory_usage_logs()

        if "error" in response:
            say(f"Error getting usage logs: {response.get('error')}")
            return

        if not response:
            say("No usage logs found.")
            return

        # Format the response
        logs = response if isinstance(response, list) else [response]
        result = "*Recent Inventory Usage:*\n"
        for log in logs[:10]:  # Show the 10 most recent
            date = log.get('timestamp', 'N/A')
            item = log.get('itemName', 'Unknown item')
            quantity = log.get('quantity', 0)
            user = log.get('userId', 'Unknown user')
            result += f"• {date}: {quantity}x {item} used by <@{user}>\n"

        say(result)

    def cmd_get_orders(self, say):
        """Handle !orders command"""
        response = self.api_handler.get_orders()

        if "error" in response:
            say(f"Error getting orders: {response.get('error')}")
            return

        if not response:
            say("No orders found.")
            return

        # Format the response
        orders = response if isinstance(response, list) else [response]
        result = "*Recent Orders:*\n"
        for order in orders[:5]:  # Show the 5 most recent
            order_id = order.get('id', 'N/A')
            vendor = order.get('vendorName', 'Unknown vendor')
            status = order.get('status', 'Unknown status').upper()
            date = order.get('orderDate', 'N/A')
            result += f"• Order #{order_id} from {vendor} - Status: {status} (Ordered: {date})\n"

            # Add items in order
            items = order.get('items', [])
            if items:
                result += "  Items:\n"
                for item in items:
                    item_name = item.get('itemName', 'Unknown item')
                    quantity = item.get('quantity', 0)
                    result += f"    - {quantity}x {item_name}\n"

        say(result)

    def cmd_show_help(self, say):
        """Show help information"""
        help_text = "*Available Commands:*\n"
        help_text += "• `!item [name]` - Get details about an inventory item\n"
        help_text += "• `!updateitem [item_id] [field] [value]` - Update an inventory item\n"
        help_text += "• `!notifications` - Show recent system notifications\n"
        # help_text += "• `!usage` - Show recent inventory usage logs\n"
        help_text += "• `!orders` - Show recent orders\n"

        if hasattr(self, 'gemini_handler'):
            help_text += "• `!aimode [on|off]` - Toggle AI-powered natural language mode\n"

        help_text += "• `!help` - Show this help message\n\n"

        if self.ai_mode_enabled:
            help_text += "*AI Mode is ENABLED*\n"
            help_text += "You can ask questions in natural language like:\n"
            help_text += "• \"How many paper towels do we have?\"\n"
            help_text += "• \"We used 3 packs of toilet paper today\"\n"
            help_text += "• \"I just restocked 10 bottles of hand soap\"\n"
            help_text += "• \"Show me recent orders\"\n\n"
        else:
            help_text += "*Other Features:*\n"
            help_text += "• `show inventory` - Display all inventory items\n"
            help_text += "• `how many [item] do we have` - Check quantity of specific item\n"
            help_text += "• `[quantity] [item] used/taken` - Record item usage\n"
            help_text += "• `[quantity] [item] replenished/restocked/refilled` - Record item restock\n"

        help_text += "• `need coverage` or `can someone cover` - Request shift coverage\n"

        say(help_text)

    def extract_inventory_data(self, text):
        match = re.search(
            r"(\d+|one|two|three|four|five|six|seven|eight|nine|ten) ?x? ([a-z ]+?) (replenished|refilled|restocked|used|taken)",
            text)
        if match:
            num_str, item, action = match.groups()
            quantity = self.convert_to_number(num_str)
            return item.strip(), quantity, action
        return None, None, None

    def convert_to_number(self, num_str):
        try:
            return int(num_str)
        except:
            word_to_num = {
                "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
                "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10
            }
            return word_to_num.get(num_str.lower(), 0)

    def update_inventory(self, say, channel, item, quantity, user_id):
        # Check if item exists in the API first
        api_item = self.api_handler.get_inventory_item(item)

        if api_item and not "error" in api_item:
            # Item exists in API, update it there
            try:
                item_data = api_item[0] if isinstance(api_item, list) else api_item
                item_id = item_data.get('id')
                current_quantity = item_data.get('quantity', 0)
                min_stock = item_data.get('minStockLevel', 0)

                new_quantity = max(0, current_quantity - quantity)
                update_data = {"quantity": new_quantity}

                # Record usage in API
                usage_data = {
                    "itemId": item_id,
                    "quantity": quantity,
                    "userId": user_id,
                    "timestamp": datetime.now().isoformat()
                }
                self.api_handler.record_inventory_usage(usage_data)

                # Update the item in API
                self.api_handler.update_inventory_item(item_id, update_data)

                # Notify based on stock level
                if new_quantity <= 0:
                    say(f"️ <@{self.manager_id}>, we are out of {item}!")
                elif new_quantity <= min_stock:
                    say(f"{quantity} {item} used. {new_quantity} left. Notifying manager...")
                    say(f"️ <@{self.manager_id}>, please restock {item} soon!")
                else:
                    say(f"{quantity} {item} used. {new_quantity} left.")

                self.log_action(user_id, f"Used {quantity} {item}. {new_quantity} left.")

            except Exception as e:
                print(f"Error updating via API: {str(e)}")
                # Fall back to local inventory
                self._update_local_inventory(say, item, quantity, user_id)
        else:
            # Fall back to local inventory if not in API
            self._update_local_inventory(say, item, quantity, user_id)

    def _update_local_inventory(self, say, item, quantity, user_id):
        """Legacy method to update local inventory (fallback)"""
        if item in self.inventory:
            self.inventory[item] -= quantity
            remaining = self.inventory[item]
            if remaining <= 0:
                say(f"️ <@{self.manager_id}>, we are out of {item}!")
            elif remaining <= 3:
                say(f"{quantity} {item} used. {remaining} left. Notifying manager...")
                say(f"️ <@{self.manager_id}>, please restock {item} soon!")
            else:
                say(f"{quantity} {item} used. {remaining} left.")

            self.log_action(user_id, f"Used {quantity} {item}. {remaining} left.")
        else:
            say(f"Item '{item}' not found in inventory!")

    def refill_inventory(self, say, channel, item, quantity, user_id):
        # Check if item exists in the API first
        api_item = self.api_handler.get_inventory_item(item)

        if api_item and not "error" in api_item:
            # Item exists in API, update it there
            try:
                item_data = api_item[0] if isinstance(api_item, list) else api_item
                item_id = item_data.get('id')
                current_quantity = item_data.get('quantity', 0)

                new_quantity = current_quantity + quantity
                update_data = {"quantity": new_quantity}

                # Update the item in API
                self.api_handler.update_inventory_item(item_id, update_data)

                say(f"{quantity} {item} restocked. {new_quantity} now available.")
                self.log_action(user_id, f"Restocked {quantity} {item}. Now {new_quantity} available.")

            except Exception as e:
                print(f"Error updating via API: {str(e)}")


    def get_or_create_logs_channel(self, channel_name):
        try:
            response = self.client.conversations_list()
            if response["ok"]:
                for channel in response["channels"]:
                    if channel["name"] == channel_name:
                        return channel["id"]

            # If not found, create the channel
            create_response = self.client.conversations_create(name=channel_name)
            if create_response["ok"]:
                return create_response["channel"]["id"]
            else:
                print("Error creating channel:", create_response["error"])
        except Exception as e:
            print(f"Error finding or creating logs channel: {str(e)}")
        return None

    def log_action(self, user_id, action):
        """Log an action to the logs channel"""
        if self.logs_channel:
            try:
                self.client.chat_postMessage(
                    channel=self.logs_channel,
                    text=f"<@{user_id}> {action}"
                )
            except Exception as e:
                print(f"Error logging action: {str(e)}")

    def _refill_local_inventory(self, say, item, quantity, user_id):
        """Legacy method to update local inventory (fallback)"""
        if item in self.inventory:
            self.inventory[item] += quantity
            say(f"{quantity} {item} restocked. {self.inventory[item]} now available.")
            self.log_action(user_id, f"Restocked {quantity} {item}. Now {self.inventory[item]} available.")
        else:
            say(f"Item '{item}' not found in inventory!")

    def show_inventory(self, say, channel, text):
        match = re.search(r"how many ([a-z ]+) do we have", text)
        if match:
            item = match.group(1).strip()

            # Try API first
            api_item = self.api_handler.get_inventory_item(item)
            if api_item and not "error" in api_item:
                item_data = api_item[0] if isinstance(api_item, list) else api_item
                quantity = item_data.get('quantity', 0)
                say(f"{item}: {quantity} in stock.")
            elif item in self.inventory:
                # Fall back to local inventory
                say(f"{item}: {self.inventory[item]} in stock.")
            else:
                say(f"No record of '{item}' in inventory.")
        else:
            # Get all inventory items from API
            api_items = self.api_handler.get_inventory_items()

            if api_items and not "error" in api_items and len(api_items) > 0:
                # Use API inventory
                inventory_list = "\n".join(
                    [f"- {item.get('name')}: {item.get('quantity')} in stock" for item in api_items])
                say(f"**Inventory:**\n{inventory_list}")
            else:
                # Fall back to local inventory
                inventory_list = "\n".join([f"- {item}: {count}" for item, count in self.inventory.items()])
                say(f"**Inventory:**\n{inventory_list}")

    def detect_shift_request(self, text):
        return "need coverage" in text or "can someone cover" in text

    def detect_shift_acceptance(self, text, user_id):
        return "i can cover" in text or "i got it" in text

    def log_shift_request(self, user_id, text, ts):
        self.shift_requests[ts] = user_id
        self.client.chat_postMessage(
            channel=self.logs_channel,
            text=f"<@{user_id}> requested shift coverage:\n>{text}"
        )

    def confirm_shift_coverage(self, covering_user, text):
        self.client.chat_postMessage(
            channel=self.logs_channel,
            text=f"<@{covering_user}> volunteered to cover the shift:\n>{text}"
        )

    def handle_reaction_shift_coverage(self, covering_user, message_ts):
        original_user = self.shift_requests.get(message_ts)
        if original_user:
            self.client.chat_postMessage(
                channel=self.logs_channel,
                text=f"<@{covering_user}> confirmed ✅ covering shift for <@{original_user}>."
            )
        else:
            self.client.chat_postMessage(
                channel=self.logs_channel,
                text=f"<@{covering_user}> reacted to an unknown shift message."
            )

if __name__ == "__main__":

    SLACK_BOT_TOKEN = ""
    SLACK_APP_TOKEN = ""

    API_BASE_URL = ""

    API_TOKEN = ""

    GEMINI_API_KEY = ""

    # Check for required environment variables
    if not SLACK_BOT_TOKEN or not SLACK_APP_TOKEN:
        print("Error: SLACK_BOT_TOKEN and SLACK_APP_TOKEN environment variables are required")
        exit(1)

    if not API_BASE_URL or not API_TOKEN:
        print("Error: API_BASE_URL and API_TOKEN environment variables are required")
        exit(1)

    print("Starting Inventory Bot...")
    print(f"AI Mode: {'Enabled' if GEMINI_API_KEY else 'Disabled'}")

    # Initialize and start the bot
    bot = BotBolt(
        bot_token=SLACK_BOT_TOKEN,
        app_token=SLACK_APP_TOKEN,
        api_base_url=API_BASE_URL,
        api_token=API_TOKEN,
        gemini_api_key=GEMINI_API_KEY  # This will be None if not set
    )

    # Start the bot listener
    bot.listener()