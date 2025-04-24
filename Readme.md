### Inventory Management Slack Bot

A comprehensive inventory management system with a Slack bot interface, allowing teams to track, update, and manage inventory items directly from Slack.

## Features

- **Slack Integration**: Interact with your inventory system directly from Slack
- **AI-Powered Responses**: Natural language processing using Google's Gemini AI
- **Inventory Tracking**: Monitor stock levels, usage, and restocking
- **Notifications**: Automatic alerts for low stock items
- **User Management**: Track who uses or restocks items
- **Order Management**: View and manage purchase orders
- **Shift Coverage**: Request and confirm shift coverage between team members


## System Architecture

```mermaid
System Architecture.download-icon {
            cursor: pointer;
            transform-origin: center;
        }
        .download-icon .arrow-part {
            transition: transform 0.35s cubic-bezier(0.35, 0.2, 0.14, 0.95);
             transform-origin: center;
        }
        button:has(.download-icon):hover .download-icon .arrow-part, button:has(.download-icon):focus-visible .download-icon .arrow-part {
          transform: translateY(-1.5px);
        }
        #mermaid-diagram-r67{font-family:var(--font-geist-sans);font-size:12px;fill:#000000;}#mermaid-diagram-r67 .error-icon{fill:#552222;}#mermaid-diagram-r67 .error-text{fill:#552222;stroke:#552222;}#mermaid-diagram-r67 .edge-thickness-normal{stroke-width:1px;}#mermaid-diagram-r67 .edge-thickness-thick{stroke-width:3.5px;}#mermaid-diagram-r67 .edge-pattern-solid{stroke-dasharray:0;}#mermaid-diagram-r67 .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-diagram-r67 .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-diagram-r67 .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-diagram-r67 .marker{fill:#666;stroke:#666;}#mermaid-diagram-r67 .marker.cross{stroke:#666;}#mermaid-diagram-r67 svg{font-family:var(--font-geist-sans);font-size:12px;}#mermaid-diagram-r67 p{margin:0;}#mermaid-diagram-r67 .label{font-family:var(--font-geist-sans);color:#000000;}#mermaid-diagram-r67 .cluster-label text{fill:#333;}#mermaid-diagram-r67 .cluster-label span{color:#333;}#mermaid-diagram-r67 .cluster-label span p{background-color:transparent;}#mermaid-diagram-r67 .label text,#mermaid-diagram-r67 span{fill:#000000;color:#000000;}#mermaid-diagram-r67 .node rect,#mermaid-diagram-r67 .node circle,#mermaid-diagram-r67 .node ellipse,#mermaid-diagram-r67 .node polygon,#mermaid-diagram-r67 .node path{fill:#eee;stroke:#999;stroke-width:1px;}#mermaid-diagram-r67 .rough-node .label text,#mermaid-diagram-r67 .node .label text{text-anchor:middle;}#mermaid-diagram-r67 .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#mermaid-diagram-r67 .node .label{text-align:center;}#mermaid-diagram-r67 .node.clickable{cursor:pointer;}#mermaid-diagram-r67 .arrowheadPath{fill:#333333;}#mermaid-diagram-r67 .edgePath .path{stroke:#666;stroke-width:2.0px;}#mermaid-diagram-r67 .flowchart-link{stroke:#666;fill:none;}#mermaid-diagram-r67 .edgeLabel{background-color:white;text-align:center;}#mermaid-diagram-r67 .edgeLabel p{background-color:white;}#mermaid-diagram-r67 .edgeLabel rect{opacity:0.5;background-color:white;fill:white;}#mermaid-diagram-r67 .labelBkg{background-color:rgba(255, 255, 255, 0.5);}#mermaid-diagram-r67 .cluster rect{fill:hsl(0, 0%, 98.9215686275%);stroke:#707070;stroke-width:1px;}#mermaid-diagram-r67 .cluster text{fill:#333;}#mermaid-diagram-r67 .cluster span{color:#333;}#mermaid-diagram-r67 div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:var(--font-geist-sans);font-size:12px;background:hsl(-160, 0%, 93.3333333333%);border:1px solid #707070;border-radius:2px;pointer-events:none;z-index:100;}#mermaid-diagram-r67 .flowchartTitleText{text-anchor:middle;font-size:18px;fill:#000000;}#mermaid-diagram-r67 .flowchart-link{stroke:hsl(var(--gray-400));stroke-width:1px;}#mermaid-diagram-r67 .marker,#mermaid-diagram-r67 marker,#mermaid-diagram-r67 marker *{fill:hsl(var(--gray-400))!important;stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-r67 .label,#mermaid-diagram-r67 text,#mermaid-diagram-r67 text>tspan{fill:hsl(var(--black))!important;color:hsl(var(--black))!important;}#mermaid-diagram-r67 .background,#mermaid-diagram-r67 rect.relationshipLabelBox{fill:hsl(var(--white))!important;}#mermaid-diagram-r67 .entityBox,#mermaid-diagram-r67 .attributeBoxEven{fill:hsl(var(--gray-150))!important;}#mermaid-diagram-r67 .attributeBoxOdd{fill:hsl(var(--white))!important;}#mermaid-diagram-r67 .label-container,#mermaid-diagram-r67 rect.actor{fill:hsl(var(--white))!important;stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-r67 line{stroke:hsl(var(--gray-400))!important;}#mermaid-diagram-r67 :root{--mermaid-font-family:var(--font-geist-sans);}Slack AppInventoBot (Slack Bot)Inventory API HandlerGemini AI HandlerBackend API ServerGoogle Gemini API
```

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
pip install slack-bolt slack-sdk requests python-dotenv google-generativeai
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

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
