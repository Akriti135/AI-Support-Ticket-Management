# AI Support & Ticket Management System

A full-stack, enterprise-grade **AI Support & Ticket Management System** featuring **Java 21**, **Spring Boot 3**, **Spring Security (JWT)**, **MySQL**, **React (Vite)**, and optional local **Ollama AI** integration.

---

## 🌟 Key Features

### 1. Role-Based Access Control (RBAC)
- **ROLE_USER**: Submit support tickets, track progress, add comments, view personal ticket history.
- **ROLE_AGENT**: Browse all tickets, get assigned to tickets, update statuses, leave internal/external comments, run AI summaries.
- **ROLE_ADMIN**: Full platform access, admin dashboard metrics, user role management, system-wide ticket audit trail.

### 2. Complete Ticket Lifecycle Management
- **Categories**: `TECHNICAL`, `BILLING`, `GENERAL`
- **Priorities**: `LOW`, `MEDIUM`, `HIGH`
- **Statuses**: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`
- **Full History Audit Trail**: Tracks every status change, agent assignment, comment, and edit with timestamps and author details.
- **Live Search & Multi-Filter**: Filter tickets dynamically by status, category, priority, and keyword search.

### 3. Local AI Assistance (Ollama)
- **1-Click AI Ticket Summary & Suggested Action** using locally installed **Ollama** (`llama3` model).
- **Graceful Fallback**: If Ollama is offline or unavailable, the backend automatically provides intelligent rule-based heuristic summaries and suggested actions—the system never crashes or hangs!

---

## 🛠️ Technology Stack

### Backend
- **Java**: 21+
- **Framework**: Spring Boot 3.3.5
- **Security**: Spring Security + JWT (HMAC-SHA256)
- **Database Access**: Spring Data JPA / Hibernate
- **Database**: MySQL 8.x
- **Build Tool**: Maven

### Frontend
- **Library**: React 18
- **Tooling**: Vite 5
- **Routing**: React Router DOM 6
- **HTTP Client**: Axios (with JWT interceptors)
- **Styling**: Modern dark navy, royal blue, and crisp white theme

---

## 🔑 Demo Login Accounts

The database automatically seeds these three accounts upon the first run:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@aiticket.com` | `admin123` | Full control, Admin dashboard, Role assignment |
| **Agent** | `agent@aiticket.com` | `agent123` | Assign tickets, update status, view all queues |
| **User** | `user@aiticket.com` | `user123` | Create & view own tickets, post comments |

> **Tip**: The login page includes convenient **1-Click Demo Fill buttons** for instant testing!

---

## 🚀 Setup & Running Instructions

### 1. Database Setup (MySQL)
1. Ensure your MySQL server is running (e.g., via MySQL Workbench, XAMPP, or Windows Service).
2. Create the database:
   ```sql
   CREATE DATABASE IF NOT EXISTS ai_ticket_db;
   ```
3. (Optional) Run the provided `database.sql` script to inspect or pre-create tables. Spring Boot's JPA will also auto-create and validate the schema upon launch.

### 2. Configure Backend Credentials
Edit `backend/src/main/resources/application.properties` or provide environment variables:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ai_ticket_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD_HERE
```

### 3. Run Backend (Spring Boot)
Open a terminal in the `backend` folder:
```powershell
cd backend
mvn clean spring-boot:run
```
The backend API server will start at: `http://localhost:8080`

### 4. Run Frontend (React + Vite)
Open a separate terminal in the `frontend` folder:
```powershell
cd frontend
npm install
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## 🤖 (Optional) Local Ollama AI Setup

To enable LLM generation for ticket summaries:
1. Download and install **Ollama** from [https://ollama.ai](https://ollama.ai).
2. Pull and start the `llama3` model:
   ```powershell
   ollama run llama3
   ```
3. The backend connects automatically to `http://localhost:11434/api/generate`.
4. If Ollama is not running, the application will transparently fall back to rule-based heuristic summaries without interruption.

---

## 📡 REST API Summary

### Authentication
- `POST /api/auth/register` — Register a new account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Get current logged-in user details

### Tickets
- `GET /api/tickets` — List & filter tickets (by status, category, priority, keyword)
- `POST /api/tickets` — Create a new support ticket
- `GET /api/tickets/{id}` — Get ticket details
- `PUT /api/tickets/{id}` — Update ticket information
- `DELETE /api/tickets/{id}` — Delete ticket (creator or admin only)
- `PUT /api/tickets/{id}/status` — Update ticket status
- `PUT /api/tickets/{id}/assign` — Assign ticket to an agent (agents/admins)
- `POST /api/tickets/{id}/comments` — Add a comment to ticket
- `GET /api/tickets/{id}/comments` — List comments for ticket
- `GET /api/tickets/{id}/history` — Retrieve ticket activity audit history

### Admin
- `GET /api/admin/stats` — Overall system statistics & breakdowns
- `GET /api/admin/users` — List all registered users
- `PUT /api/admin/users/{id}/role` — Change user role (USER, AGENT, ADMIN)

### AI
- `POST /api/ai/summarize/{ticketId}` — Generate AI summary and recommended next action

---

## 📁 Project Structure

```text
AITicketManagement/
├── backend/
│   ├── src/main/java/com/aiticket/
│   │   ├── config/              # Security, JWT, CORS, DataInitializer
│   │   ├── controller/          # REST Endpoints (Auth, Ticket, Admin, AI)
│   │   ├── dto/                 # Request & Response Data Transfer Objects
│   │   ├── exception/           # Global Exception Handling
│   │   ├── model/               # JPA Entities & Enums
│   │   ├── repository/          # Spring Data Repositories
│   │   ├── service/             # Business Logic & AI Client
│   │   └── AiTicketApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios HTTP client with JWT interceptor
│   │   ├── components/          # Sidebar, Navbar, Badges, ProtectedRoute
│   │   ├── context/             # Auth Context & Session Management
│   │   ├── pages/               # Login, Register, Dashboard, Tickets, Details, Admin
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css            # Dark navy & royal blue theme
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── database.sql                 # MySQL schema
├── .gitignore
└── README.md
```
