# Inventory Management Dashboard

A responsive dashboard for U&I services at Truman State University
for managing inventory, tracking reports, and monitoring recent activity. It is built with **Next.js**, **React**, and **Tailwind CSS**,
and this project provide a modern and user-friendly interface for inventory management.

---

# Features
## Dashboard
- **Overview**: View total items, low-stock items, orders placed, and total vendors.
- **Daily Logs**: Track the consumption of different supplies available in the inventory across different locations.
- **Inventory**: Edit, delete, manage and view all the items in the inventory. Report the usage of certain items if they are stolen, lost, or damaged.
- **Reports**: Monthly analytics, item popularity, department usages, low stock alerts, inventory values, and usage statistics for inventory. Export the reports.
- **Interactive Charts**: Visualize data using bar charts.
- **Responsive Design**: Fully optimized for desktop.
- **Add new item**: Lets user add the new item in the database.

## All Users
- Page especially for admins to manage user accounts and their access levels.
- Consists the information about user, their email, role and slack ID.
- Role-based filter so that only admins can use edit or delete action.
- `Add new user` allows admin to add new user in case of they join the U&I staff and delete them in case they leave.
- Only users added in this will be able to access this website.

## Your Profile
- Page for users to view their personal information like name, email, role, and slack ID.
- `Send Reset Link` will send reset password link to people who used google to authenticate.
- For the role change, users will only be able to go from higher role to lower(for example, administrator to manager), for going from lower role to higher(for example, employee to manager) they will require permission.

## Notifications
- Tracks the notifications from low stock and orders status.
- **All**: Notification from across all the sections. Users can mark a notification as read, or delete it. They can also search for certain notifications if they want to.
- **Inventory Alerts**: Track the consumption of different supplies available in the inventory across different locations.
- **Orders Placed**: All the notifications about the orders placed.
- **Orders received**: All the notifications about the orders placed.

## SlackBot
For admins to configure the Slack Bot.

## Dark Mode
- For resting your eyes from all the stress from the light mode.


---

## Tech Stack

- **Frontend**: React, Next.js, Tailwind CSS, TypeScript
- **Charts**: Recharts
- **UI Components**: Radix UI
- **State Management**: React Hooks
- **Authentication**: Auth0 by Okta

---

## Installation

1. Clone the repository: (Dev or main based on your preferences and commit)
   ```
   git clone -b frontend-main https://github.com/shibampokerail/InventoryManagementDashboard.git
   ```
   ```
   cd InventoryManagementDashboard
   ```
2. Install Dependencies (Make sure your terminal is in the same folder):
   ```
    npm install
   ```
3. Configure Environment variables:
   <br> Create a .env file in the root directory and add the following environment variables:
   ```
   AUTH0_SECRET
   AUTH0_BASE_URL
   AUTH0_ISSUER_BASE_URL
   AUTH0_CLIENT_ID
   AUTHO_CLIENT_SECRET
   NEXT_PUBLIC_API_URL
   ```
   
5. Start the dev server:
```
   npm run dev - start the development server

```

```
npm run build - build the project for production
npm start
```
6. Open in your local browser:
   <br>http://localhost:3006



