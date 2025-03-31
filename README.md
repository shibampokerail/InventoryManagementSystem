# Inventory Management Dashboard

A responsive dashboard for U&I services at Truman State University
for managing inventory, tracking reports, and monitoring recent activity. It is built with **Next.js**, **React**, and **Tailwind CSS**,
and this project provides a modern and user-friendly interface for inventory management.

---

## Features

- **Inventory Overview**: View total items, low-stock items, and upcoming returns.
- **Reports**: Monthly analytics, item popularity, department usages, low stock alerts, inventory values, and usage statistics for inventory. Export the reports.
- **Interactive Charts**: Visualize data using bar charts (powered by `recharts`).
- **Responsive Design**: Fully optimized for desktop.
- **Check Out**: Lets the users checkout the items and save it on database. Shows the checkout history as well.
- **Inventory**: Consists of items available in the inventory.
- **Ad new item**: Lets user add the new item in the database

---

## Tech Stack

- **Frontend**: React, Next.js, Tailwind CSS, TypeScript
- **Charts**: Recharts
- **UI Components**: Radix UI
- **State Management**: React Hooks

---

## Installation

1. Clone the repository:
   
   git clone https://github.com/shibampokerail/InventoryManagementDashboard.git
   cd InventoryManagementDashboard
2. Install Dependencies:

    npm install
3. Start the dev server:

   npm run dev

4. Open in your local browser:
   http://localhost:3000

## Folder Structure
.
├── app/
│   ├── page.tsx          # Main dashboard page
│   ├── components/       # Reusable UI components
│   ├── styles/           # Global styles
├── public/               # Static assets
├── middleware.ts         # Middleware for authentication
├── package.json          # Project dependencies and scripts
└── README.md             # Project documentation

