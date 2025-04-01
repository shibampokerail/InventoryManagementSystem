import requests
import json
from slack_sdk import WebClient
from slack_bolt import App
from slack_bolt.adapter.socket_mode import SocketModeHandler
from datetime import datetime, timedelta
import re

# BotWebAPI Class for Web API interactions
class BotWebAPI:
    def __init__(self, bot_token):
        self.bot_token = bot_token
        self.headers = {
            'Authorization': f'Bearer {self.bot_token}',
            'Content-Type': 'application/json'
        }

        self.client = WebClient(token=bot_token)

    def post_message(self, message="Hello! This is a test...", channel_id='C08KG5C89AQ', ):

        """
        Post a message to the Slack channel using the Web API.
        """
        url = 'https://slack.com/api/chat.postMessage'
        payload = {
            'channel': channel_id,
            'text': message
        }

        response = requests.post(url, headers=self.headers, data=json.dumps(payload))

        # Check the response
        if response.status_code == 200:
            response_data = response.json()
            if response_data.get('ok'):
                print('Message posted successfully.')
            else:
                print(f"Error posting message: {response_data.get('error')}")
        else:
            print(f"HTTP error: {response.status_code}")

    def join_channel(self, channel_id):
        """
        Make the bot join a public or private channel.
        """
        url = 'https://slack.com/api/conversations.join'
        payload = {
            'channel': channel_id
        }

        response = requests.post(url, headers=self.headers, data=json.dumps(payload))

        if response.status_code == 200:
            response_data = response.json()
            if response_data.get('ok'):
                print(f"Bot successfully joined the channel {channel_id}.")
            else:
                print(f"Error joining channel: {response_data.get('error')}")
        else:
            print(f"HTTP error: {response.status_code}")

    def set_reminder(self, user_id, reminder_text, reminder_time):

        """
        Set a reminder for a user.
        :param user_id: Slack user ID (e.g., U12345678)
        :param reminder_text: Text for the reminder
        :param reminder_time: Time in ISO format (e.g., '2025-03-26T09:00:00')
        """

        try:
            # Use the reminders.add API to set the reminder
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

# BotBolt Class for using the Slack Bolt framework
import re
import datetime
from slack_bolt import App
from slack_sdk import WebClient
from slack_bolt.adapter.socket_mode import SocketModeHandler

class BotBolt:
    def __init__(self, bot_token, app_token):
        self.app = App(token=bot_token)
        self.app_token = app_token
        self.bot_token = bot_token
        self.client = WebClient(token=bot_token)

        self.inventory = {
            "paper towels": 10,
            "packs of liquid soap": 5,
            "toilet paper": 12
        }
        self.manager_id = "U08KC6YB4N7"
        self.logs_channel = self.get_or_create_logs_channel("manager-logs")  # Create logs channel
        self.shift_requests = {}

    def listener(self):
        """
        Listen for events like new messages and process them.
        """

        @self.app.event("message")
        def handle_message_events(event, say):
            text = event.get("text", "").lower()
            user_id = event.get("user")
            channel = event.get("channel")
            ts = event.get("ts")

            if user_id and text:
                if self.detect_shift_request(text):
                    self.log_shift_request(user_id, text, ts)

                elif self.detect_shift_acceptance(text, user_id):
                    self.confirm_shift_coverage(user_id, text)

                if "show inventory" in text or "how many" in text:
                    self.show_inventory(say, channel, text)
                else:
                    item, quantity, action = self.extract_inventory_data(text)
                    if item and quantity:
                        if action in ["replenished", "restocked"]:
                            self.refill_inventory(say, channel, item, quantity, user_id)
                        else:
                            self.update_inventory(say, channel, item, quantity, user_id)

        @self.app.event("reaction_added")
        def handle_reaction(event):
            if event["reaction"] == "white_check_mark":  # ✅ Reaction
                message_ts = event["item"]["ts"]
                covering_user = event["user"]
                self.handle_reaction_shift_coverage(covering_user, message_ts)

        # Start the app using SocketModeHandler (use SocketMode for real-time interactions)
        handler = SocketModeHandler(self.app, self.app_token)
        handler.start()

    def extract_inventory_data(self, text):
        """
        Extract item, quantity, and action from messages like:
        - "2 x paper towels have been replenished"
        - "two soap refilled in restroom"
        - "3 toilet papers used"
        """
        match = re.search(
            r"(\d+|one|two|three|four|five|six|seven|eight|nine|ten) ?x? ([a-z ]+?) (replenished|refilled|restocked|used|taken)",
            text)

        # match = re.search(
        #     r"(replenished|refilled|restocked|used|taken)?\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten)?\s*(rolls of|packs of|boxes of|bottles of|units of|x)?\s*([a-z ]+?)\s*(replenished|refilled|restocked|used|taken)?",
        #     text, re.IGNORECASE
        # )
        if match:
            num_str, item, action = match.groups()
            quantity = self.convert_to_number(num_str)
            return item.strip(), quantity, action
        return None, None, None
        # match = re.search(
        #     r"(replenished|refilled|restocked|used|taken)?\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten)?\s*(rolls of|packs of|boxes of|bottles of|units of|x)?\s*([a-z ]+?)\s*(replenished|refilled|restocked|used|taken)?",
        #     text, re.IGNORECASE
        # )
        #
        # if match:
        #     action1, num_str, descriptor, item, action2 = match.groups()
        #     action = action1 or action2  # Take the action whether it appears before or after
        #     quantity = self.convert_to_number(num_str) if num_str else 1  # Default quantity is 1
        #     descriptor = descriptor if descriptor else ""  # Handle missing descriptors
        #
        #     return action, quantity, descriptor.strip(), item.strip()

        return None, None, None, None

    def convert_to_number(self, num_str):
        try:
            num = int(num_str)
            return num

        except:
               try:
                   word_to_num = {
                       "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
                       "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10
                   }
                   return word_to_num[num_str]
               except:

                print("Unable to convert "+num_str+" to number")
                return 0

    def update_inventory(self, say, channel, item, quantity, user_id):
        """
        Updates the inventory and alerts when stock is low.
        """
        if item in self.inventory:
            self.inventory[item] -= quantity
            if self.inventory[item] < 0:
                say(f"️ <@{self.manager_id}>, we do not have enough {item}!")
            remaining = self.inventory[item]

            if remaining == 0:
                say(f"️ <@{self.manager_id}>, we are out of {item}!")
            elif remaining <= 3:
                say(f"{quantity} {item} removed from the inventory. {remaining} remaining.")
                say(f"️ <@{self.manager_id}>, added {item} to the next purchase batch!")
            else:
                say(f"{quantity} {item} removed from the inventory. {remaining} remaining.")

            self.log_action(user_id, f"Removed {quantity} {item}. {remaining} remaining.")
        else:
            say(f"Item '{item}' not found in inventory. Please add it first!")

    def refill_inventory(self, say, channel, item, quantity, user_id):
        """
        Refills/restocks an item in the inventory.
        """
        if item in self.inventory:
            self.inventory[item] += quantity
            say(f"{quantity} {item} added back to the inventory. Total: {self.inventory[item]} remaining.")

            self.log_action(user_id, f"Restocked {quantity} {item}. Now {self.inventory[item]} available.")
        else:
            say(f"Item '{item}' not found in inventory. Please add it first!")

    def show_inventory(self, say, channel, text):
        """
        Displays the inventory.
        - If a specific item is mentioned: "How many paper towels do we have?"
        - Otherwise, shows the full inventory: "Show inventory"
        """
        match = re.search(r"how many ([a-z ]+) do we have", text)
        if match:
            item = match.group(1).strip()
            if item in self.inventory:
                say(f"Current stock of {item}: {self.inventory[item]}")
            else:
                say(f"Item '{item}' not found in inventory.")
        else:
            inventory_list = "\n".join([f"- {item}: {count}" for item, count in self.inventory.items()])
            say(f" **Current Inventory:**\n{inventory_list}")

    def get_or_create_logs_channel(self, channel_name):
        """
        Checks if the manager logs channel exists; if not, creates it.
        """
        try:
            # Fetch the list of channels
            response = self.client.conversations_list()
            if response["ok"]:
                for channel in response["channels"]:
                    if channel["name"] == channel_name:
                        print(f" Found existing channel: #{channel_name}")
                        return channel["id"]

            # Create the channel if not found
            print(f"⚡ Creating a new channel: #{channel_name}...")
            create_response = self.client.conversations_create(name=channel_name)
            if create_response["ok"]:
                new_channel_id = create_response["channel"]["id"]

                # Ensure the bot joins the newly created channel
                self.client.conversations_join(channel=new_channel_id)
                print(f" Bot joined #{channel_name}")
                return new_channel_id
            else:
                print(f" Error creating channel: {create_response['error']}")

        except Exception as e:
            print(f"🚨 Error in get_or_create_logs_channel: {e}")

        return None

    def log_action(self, user_id, message):
        """
        Logs inventory changes in the manager's logs channel.
        """
        if self.logs_channel:
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            self.client.chat_postMessage(
                channel=self.logs_channel,
                text=f" *{timestamp}* - <@{user_id}> {message}"
            )

    def detect_shift_request(self, text):
        """
        Detects if a message is a shift coverage request.
        """
        return any(
            phrase in text for phrase in ["cover my shift", "i will not be able to come", "can someone please cover", "cover my evening shift"])

    def log_shift_request(self, user_id, text, ts):
        """
        Logs the shift coverage request in the manager-logs channel.
        """
        message = f"📌 Shift coverage request from <@{user_id}>: \"{text}\""
        self.shift_requests[ts] = user_id  # Store request details
        self.client.chat_postMessage(channel=self.logs_channel, text=message)

    def detect_shift_acceptance(self, text, user_id):
        """
        Detects when someone agrees to cover a shift.
        """
        return any(phrase in text for phrase in ["i can cover", "can cover"])

    def confirm_shift_coverage(self, covering_user, text):
        """
        Logs and confirms shift coverage.
        """
        original_user = self.find_original_requester()
        if original_user:
            message = f"✅ <@{covering_user}> has agreed to cover <@{original_user}>'s shift!"
            self.client.chat_postMessage(channel=self.logs_channel, text=message)

    def find_original_requester(self):
        """
        Finds the original user who requested shift coverage.
        """
        if self.shift_requests:
            latest_ts = max(self.shift_requests.keys())  # Get the latest shift request
            return self.shift_requests[latest_ts]
        return None

    def handle_reaction_shift_coverage(self, covering_user, message_ts):
        """
        Detects ✅ reaction and logs shift coverage.
        """
        original_user = self.shift_requests.get(message_ts)
        if original_user:
            message = f"✅ <@{covering_user}> has agreed to cover <@{original_user}>'s shift!"
            self.client.chat_postMessage(channel=self.logs_channel, text=message)

