from google import genai
from google.genai import types
import json
from datetime import datetime, timedelta

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
                            "description": "The name of the inventory item used. It could be just table, or other supplies."
                        },
                        "quantity": {
                            "type": "integer",
                            "description": "The quantity used"
                        },

                    },
                    "required": ["item_name", "quantity"]
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

                    },
                    "required": ["item_name", "quantity"]
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

    def process_message(self, message_text, user_name):
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
                result = self._execute_function(function_name, function_args, user_name)

                # Generate a user-friendly response based on the function result
                system_instruction = "Respond to user queries without referencing internal program mechanics or function implementations. Do not name any functions. Act like a human friend. You should not have follow up questions in your response."

                follow_up_response = self.client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=[
                        "The user asked: " + message_text,
                        "Function called: " + function_name,
                        "Function result: " + json.dumps(result),
                        system_instruction
                    ]
                )

                return follow_up_response.text
            else:
                # If no function call was needed, return the direct response
                return response.text

        except Exception as e:
            print(f"Error processing with Gemini: {str(e)}")
            return f"I'm sorry, I encountered an error while processing your request. Please try again or use a command directly."

    def get_user_id_by_name(self, user_name):
        """
        Find a user in the database by name, or return the default U&I Staff user ID

        Args:
            user_name: The name of the user from Slack
            slack_user_id: The Slack user ID as fallback

        Returns:
            The database user ID to use for inventory records
        """
        try:
            # Get all users from the API
            users = self.inventory_api_handler.get_users()  # Use inventory_api_handler instead of api_handler

            if not users or isinstance(users, dict) and "error" in users:
                print(f"Error getting users: {users.get('error') if isinstance(users, dict) else 'No users found'}")
                # Return the slack_user_id as fallback
                return "U&I Staff"

            # Try to find the user by name (case insensitive)
            for user in users:

                if user["name"].lower() == user_name.lower():

                    return user.get('_id')

            # If user not found by name, find the default U&I Staff user
            for user in users:
                if user.get('name') == 'U&I Staff' and user.get('role') == 'user':
                    return user.get('_id')

            # If no default user found, return the slack_user_id as fallback
            return "U&I Staff"

        except Exception as e:
            print(f"Error looking up user: {str(e)}")
            return "U&I Staff"

    def _execute_function(self, function_name, args, user_name):
        """Execute the appropriate function based on the function call from Gemini"""
        if function_name == "get_inventory_items":
            return self.inventory_api_handler.get_inventory_items()

        elif function_name == "get_inventory_item":
            return self.inventory_api_handler.get_inventory_item(args.get("name", ""))

        elif function_name == "update_inventory_usage":
            item_name = args.get("item_name", "")
            quantity = args.get("quantity", 0) # Get provided name or empty string

            # Get the database user ID
            db_user_id = self.get_user_id_by_name(user_name)

            # Get the item ID first
            api_item = self.inventory_api_handler.get_inventory_item(name=item_name)

            if api_item and not isinstance(api_item, dict) and "error" not in api_item and len(api_item) > 0:
                item_data = api_item[0]
                item_id = item_data.get('_id')
                current_quantity = item_data.get('quantity', 0)
                min_stock = item_data.get('minQuantity', 0)
                category = item_data.get('category', '')  # Get the item category

                if current_quantity < quantity:
                    return {
                        "error": f"Not enough {item_name} in inventory. Only {current_quantity} available."
                    }

                new_quantity = max(0, current_quantity - quantity)
                # update_data = {"quantity": new_quantity}

                # Update the item in API
                # update_result = self.inventory_api_handler.update_inventory_item(item_id, update_data)
                # if isinstance(update_result, dict) and "error" in update_result:
                #     return {"error": f"Error updating inventory: {update_result.get('error')}"}

                # Set action based on category
                action = "daily-usages"  # Default action
                if category in ["Office Equipement", "Furniture"]:
                    action = "reportedCheckedOut"

                # Record usage in API with the database user ID
                usage_data = {
                    "itemId": item_id,
                    "quantity": quantity,
                    "userId": db_user_id,  # Use the database user ID here
                    "action": action
                }
                print(self.inventory_api_handler.record_inventory_usage(usage_data))
                print(" Current Quantity:", current_quantity, " To be removed :", quantity, " Final Quantity:",
                      new_quantity)

                return {
                    "status": "success",
                    "item": item_name,
                    "quantity_used": quantity,
                    "user": user_name,
                    "remaining": new_quantity,
                    "low_stock": new_quantity <= min_stock,
                    "out_of_stock": new_quantity <= 0,
                    "action": action  # Include the action in the response
                }
            else:
                return {"error": f"Item '{item_name}' not found in inventory"}

        elif function_name == "restock_inventory":
            item_name = args.get("item_name", "")
            quantity = args.get("quantity", 0)

            # Get the database user ID
            db_user_id = self.get_user_id_by_name(user_name)

            # Get the item ID first
            api_item = self.inventory_api_handler.get_inventory_item(name=item_name)

            if api_item and not isinstance(api_item, dict) and "error" not in api_item and len(api_item) > 0:
                item_data = api_item[0]
                item_id = item_data.get('_id')
                current_quantity = item_data.get('quantity', 0)
                category = item_data.get('category', '')  # Get the item category

                new_quantity = current_quantity + quantity
                update_data = {"quantity": new_quantity}



                # Only record usage for Office Equipment and Furniture
                if category in ["Office Equipement", "Furniture"]:
                    # Record usage with "reportedReturned" action
                    usage_data = {
                        "itemId": item_id,
                        "quantity": quantity,
                        "userId": db_user_id,
                        "action": "reportedReturned"
                    }
                    print(self.inventory_api_handler.record_inventory_usage(usage_data))


                    return {
                        "status": "success",
                        "item": item_name,
                        "quantity_added": quantity,
                        "user": user_name,
                        "new_total": current_quantity+quantity,
                        "action": "reportedReturned"  # Include the action in the response
                    }
                else:
                    # For Supplies, don't record usage
                    # Update the item in API
                    update_result = self.inventory_api_handler.update_inventory_item(item_id, update_data)
                    if isinstance(update_result, dict) and "error" in update_result:
                        return {"error": f"Error updating inventory: {update_result.get('error')}"}

                    return {
                        "status": "success",
                        "item": item_name,
                        "quantity_added": quantity,
                        "user": user_name,
                        "new_total": new_quantity,
                        "action": "none"  # No action recorded
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