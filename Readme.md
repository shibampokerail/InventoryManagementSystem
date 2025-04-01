# Slack Bot Documentation

This README provides all the information you need to set up and use a Slack bot that manages shift requests, inventory tracking, and Slack interactions. The bot integrates with Slack's Web API and the Slack Bolt framework to offer a variety of helpful features for automating tasks in your Slack workspace.

---

## Table of Contents

1. [Overview](#overview)
2. [Technologies Used](#technologies-used)
3. [Prerequisites](#prerequisites)
4. [Setup](#setup)
5. [Classes and Methods](#classes-and-methods)
6. [Commands](#commands)
7. [Usage](#usage)


---

## Overview

This Slack bot has the following capabilities:

- **Post messages**: Send messages to Slack channels using Slack's Web API.
- **Inventory management**: Track and update inventory, alert when items need to be restocked, or are running low.
- **Shift coverage**: Manage shift requests and coverage through Slack messages and reactions.
- **Set reminders**: Set Slack reminders for users based on a specified time.
- **Logs**: Maintain a log of all inventory actions and shift coverage requests.

---

## Technologies Used

This bot uses the following technologies:

- **Python**: A high-level programming language for creating the bot.
- **Slack SDK**: Slack’s official Python SDK for connecting to Slack's Web API and Bolt framework.
- **Regular Expressions (Regex)**: For parsing messages related to inventory and shift requests.
- **Socket Mode**: Enables real-time interactions with Slack events.

---

## Prerequisites

Before setting up this bot, ensure that you have the following:

- Python 3.6 or higher installed.
- A Slack workspace where you can create a bot.
- Slack API token for the bot (`SLACK_BOT_TOKEN`).
- Slack app token for Socket Mode (`SLACK_APP_TOKEN`).

Install required dependencies by running:

```bash
pip install slack_sdk slack_bolt requests
```

---

## Setup

### 1. Environment Variables

Before running the bot, you'll need to set two important environment variables for authentication:

- `SLACK_BOT_TOKEN`: Your bot's Slack OAuth token.
- `SLACK_APP_TOKEN`: The app token for Socket Mode to allow real-time event listening.

Set these environment variables in your terminal:

```bash
export SLACK_BOT_TOKEN="xoxb-your-bot-token"
export SLACK_APP_TOKEN="xapp-your-app-token"
```

### 2. Run the Bot

Once your environment is set up, run the bot with the following command:

```bash
python bot.py
```

The bot will begin listening for events and interact with your Slack workspace as specified.

---

## Classes and Methods

### 1. `BotWebAPI`

This class is responsible for interacting directly with Slack’s Web API. It has methods for posting messages, joining channels, and setting reminders.

#### Methods:
- **`post_message(message, channel_id)`**: Posts a message to a Slack channel.
- **`join_channel(channel_id)`**: Makes the bot join a specific Slack channel.
- **`set_reminder(user_id, reminder_text, reminder_time)`**: Sets a reminder for a specific user.

### 2. `BotBolt`

This class uses Slack's Bolt framework to interact with events in real-time, such as messages and reactions. It provides more complex functionality for inventory management, shift requests, and logging.

#### Methods:
- **`listener()`**: The main event listener that responds to messages and reactions.
- **`extract_inventory_data(text)`**: Extracts inventory-related actions from messages, such as restocking or removing items.
- **`update_inventory(say, channel, item, quantity, user_id)`**: Updates the inventory and alerts when stock is low.
- **`refill_inventory(say, channel, item, quantity, user_id)`**: Refills an item in the inventory.
- **`show_inventory(say, channel, text)`**: Displays current inventory or checks stock of a specific item.
- **`log_action(user_id, message)`**: Logs actions (e.g., inventory changes) in a dedicated logs channel.
- **`detect_shift_request(text)`**: Detects shift coverage requests in messages.
- **`log_shift_request(user_id, text, ts)`**: Logs a shift coverage request in the manager's logs channel.
- **`detect_shift_acceptance(text, user_id)`**: Detects when a shift coverage request is accepted.
- **`confirm_shift_coverage(covering_user, text)`**: Confirms and logs when a shift is covered.
- **`get_or_create_logs_channel(channel_name)`**: Retrieves or creates a logs channel for shift requests and inventory updates.
- **`handle_reaction_shift_coverage(covering_user, message_ts)`**: Handles reactions to shift coverage requests and logs the coverage.

---

## Commands

This section lists the types of commands the bot listens for and the expected responses.

### 1. **Shift Requests**

The bot can detect and log shift coverage requests. When a user requests shift coverage, the bot responds as follows:

#### Command Examples:
- **"Can someone please cover my shift?"**
- **"I cannot come in today, is anyone available to cover?"**
- **"Cover my evening shift!"**

#### Bot Response:
- Logs the request in the **manager-logs** channel.
- Sends a message in the channel confirming the shift coverage request.

Example:
```
 Shift coverage request from <@U12345678>: "Can someone please cover my evening shift?"
```

---

### 2. **Shift Acceptance**

When someone accepts a shift coverage request, the bot can detect the acceptance and confirm the coverage.

#### Command Examples:
- **"I can cover the shift."**
- **"I’ll cover it!"**
- **"Can cover"**

#### Bot Response:
- Logs the coverage in the **manager-logs** channel.
- Confirms the coverage with a message like:
  ```
   <@U87654321> has agreed to cover <@U12345678>'s shift!
  ```

---

### 3. **Inventory Management**

The bot can manage inventory by updating, replenishing, or checking the stock of items. Commands related to inventory include:

#### Command Examples:
- **"How many paper towels do we have?"**
- **"Restock toilet paper by 3 rolls."**
- **"Used 2 packs of liquid soap."**

#### Bot Response:
- **Inventory check**: Displays the current stock.
  ```
  Current stock of paper towels: 10
  ```
- **Restocking**: Updates the stock and notifies when items are restocked.
  ```
  5 paper towels added back to the inventory. Total: 15 remaining.
  ```
- **Updating inventory**: Notifies if stock is low or out of stock.
  ```
  2 packs of liquid soap removed from the inventory. 3 remaining.
  ```

---

### 4. **General Commands**

The bot can also respond to other general queries, like showing the inventory or providing reminders.

#### Command Examples:
- **"Show inventory."**
- **"Set a reminder for 9 AM to send a report."**

#### Bot Response:
- **Inventory display**: Lists all current items and their quantities.
  ```
  **Current Inventory:**
  - paper towels: 10
  - packs of liquid soap: 5
  - toilet paper: 12
  ```
- **Setting reminders**: Confirms that the reminder has been set.
  ```
  Reminder set for 9:00 AM: "Send the report."
  ```

---

## Usage

### 1. Posting Messages

To post a message to a Slack channel, use the `post_message` method of the `BotWebAPI` class. This method takes the message content and the channel ID as arguments:

```python
bot_web_api.post_message("Hello, team! This is a test message.", "C08KG5C89AQ")
```

### 2. Managing Inventory

The bot can handle inventory actions such as restocking items or removing items when they are used. For example:

- Restocking inventory:
  ```python
  bot_bolt.refill_inventory(say, channel, "paper towels", 5, user_id)
  ```

- Removing items from inventory:
  ```python
  bot_bolt.update_inventory(say, channel, "toilet paper", 2, user_id)
  ```

- Showing inventory status:
  ```python
  bot_bolt.show_inventory(say, channel, text)
  ```

### 3. Shift Coverage

To manage shift coverage, the bot listens for shift requests and reactions. You can post a shift coverage request like:

```
Can someone please cover my evening shift?
```

The bot detects this message and logs the request. When someone agrees to cover the shift, the bot confirms the coverage.

---
