from InventoBot import BotBolt
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Retrieve environment variables
API_BASE_URL = os.getenv("API_BASE_URL")
API_TOKEN = os.getenv("API_TOKEN")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if __name__ == "__main__":
    # Check for required environment variables

    if not API_BASE_URL or not API_TOKEN:
        print("Error: API_BASE_URL and API_TOKEN environment variables are required")
        exit(1)

    print("Starting Inventory Bot...")
    print(f"AI Mode: {'Enabled' if GEMINI_API_KEY else 'Disabled'}")

    # Initialize and start the bot
    bot = BotBolt(
        api_base_url=API_BASE_URL,
        api_token=API_TOKEN,
        gemini_api_key=GEMINI_API_KEY  # This will be None if not set
    )

    # Start the bot listener
    bot.listener()
