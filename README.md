# Inventory Management System For Union & Involvement Services Truman

## Overview
The **Inventory Management System** is a three-tier application designed to streamline inventory tracking and management. It integrates a **Slack bot** for seamless communication and tracking, along with an **Admin Management Portal** for detailed manual oversight, reporting, and vendor notifications. The system ensures efficient inventory control, staff tracking, and shift management while maintaining an organized and user-friendly interface.

# Repository Structure
![git branch overview](https://github.com/user-attachments/assets/55b3f34c-3d4d-4590-84ab-3df8bc1dbf57)
```
backend-dev     → Development branch for backend changes
backend-main    → Stable production-ready backend branch
frontend-dev    → Development branch for frontend changes
frontend-main   → Stable production-ready frontend branch
slackbot-dev     → Development branch for changes in slackbot
slackbot-main   → Stable production-ready Slackbot branch
```



## Architecture
The system follows a three-tier architecture:
1. **Frontend (Presentation Layer):** Next.js + React
2. **Backend (Application Layer):** Flask (Python)
3. **Database (Data Layer):** MongoDB

![image](https://github.com/user-attachments/assets/1bffd53b-645a-4597-9334-1484405b13fc)

Note: The Slackbot Takes to the Backend directly.

## Features
### Slack Bot (Python + Slack API)
The Slack bot provides an interactive way for users and managers to interact with the inventory system directly from Slack. It enables:
- **Inventory Management:** Users can add, modify, and track inventory items.
- **Real-time Notifications:** Alerts for low-stock items, schedule changes, and important inventory updates.

### Admin Management Portal (React + NextJs)
The Admin Portal offers a more detailed and manual way to manage inventory and staff operations. It includes:
- **Inventory Control:** Manual addition, modification, and deletion of inventory items.
- **Report Generation:** Automated reports providing insights into inventory trends.
- **Vendor Notifications:** Sends notifications and restock requests via email.
- **User Access Control:** Secure authentication and role-based access for different users.
- **Slack Configuration** Configuration page that will help manage the slackbot.

### Backend Server (Flask + MongoDB + Python + JWT)
The backend server is made using the technology listed above.
- **MongoDB** For Location data storage as the university data is sensative.
- **Flask** A lightweight server
- **JWT** TO generate authentiation token making sure no-one who is not approved is logging in the system.

## How to Get Started:
- Clone the Backend Channel First using:
```
git clone -b backend-main <repository_url>
```
Follow the instruction on the backend main channel after that.

- Clone the Frontend Channel
```
git clone -b frontend-main <repository_url>
```
Follow the instrctuion on the frontend main channel.

In the similar way copy the slackbot channel and follow the instruction on that page.

## License
This project is licensed under the GPLv3 License. Feel free to use and modify it as per your needs.


