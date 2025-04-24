### Inventory Management Slack Bot

A comprehensive inventory management system with a Slack bot interface, allowing teams to track, update, and manage inventory items directly from Slack.

**After setting up the Frontend server**, follow this [video tutorial](https://youtu.be/fLMfvJNDZWE) to configure your Slackbot.

**After you have completed installing the slack** for the Chatbot: [Read the manual](https://www.shibampokhrel.com/InventoryManagementSystem/)


## Features

- **Slack Integration**: Interact with your inventory system directly from Slack
- **AI-Powered Responses**: Natural language processing using Google's Gemini AI
- **Inventory Tracking**: Monitor stock levels, usage, and restocking
- **Notifications**: Automatic alerts for low stock items
- **User Management**: Track who uses or restocks items
- **Order Management**: View and manage purchase orders
- **Shift Coverage**: Request and confirm shift coverage between team members

## Setup Instructions

### Prerequisites

- Python 3.8+
- Slack workspace with admin privileges
- Google Gemini API key (optional, for AI features)
- Backend inventory management API


### Environment Variables

Create a `.env` file in the project root with the following variables:

```plaintext
API_BASE_URL=https://your-inventory-api-url.com
API_TOKEN=your_api_token
GEMINI_API_KEY=your_gemini_api_key  # Optional
```

### Installation

1. Clone the repository
2. Install dependencies:

```plaintext
pip install -r reqiuirements.txt
```


3. Configure your Slack app:

1. Create a new Slack app at [https://api.slack.com/apps](https://api.slack.com/apps)
2. Enable Socket Mode
3. Add bot token scopes: `chat:write`, `reactions:read`, `users:read`, `channels:manage`
4. Install the app to your workspace
5. Store the bot token and app token in your backend system



4. Start the bot:

```plaintext
python main.py
```




## Usage

### Basic Commands

- `!help` - Show available commands
- `!item [name]` - Get details about an inventory item
- `!updateitem [item_id] [field] [value]` - Update an inventory item
- `!notifications` - Show recent system notifications
- `!orders` - Show recent orders
- `!aimode [on|off]` - Toggle AI-powered responses


### Natural Language (AI Mode)

When AI mode is enabled, you can interact with the bot using natural language:

- "How many paper towels do we have?"
- "We used 3 packs of toilet paper today"
- "I just restocked 10 bottles of hand soap"
- "Show me recent orders"


### Shift Coverage

Request shift coverage by saying:

- "I need coverage for my shift tomorrow"
- "Can someone cover for me on Friday?"


Accept coverage by:

- Replying "I can cover"
- Adding a ✅ reaction to the request


## Project Structure

- `main.py` - Entry point that initializes the bot
- `InventoBot.py` - Main bot implementation with Slack interaction logic
- `InventoryAPI.py` - API handler for communicating with the backend
- `AI.py` - Gemini AI integration for natural language processing


## Development

### Adding New Commands

To add a new command, modify the `handle_command` method in `InventoBot.py`:

```python
def handle_command(self, say, channel, text, user_id):
    # ...
    elif command == "your_new_command":
        self.cmd_your_new_function(say, args)
    # ...
```

### Extending AI Capabilities

To add new AI functions, update the `function_declarations` in `GeminiHandler.__init__` and implement the corresponding function in `_execute_function`.

