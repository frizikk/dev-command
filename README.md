# ⚡ DevCommand: Cyberpunk Task Hub

A hyper-fast, keyboard-centric, and AI-ready task management dashboard with a "Cyberpunk HUD" aesthetic. Designed for developers who live in the terminal but need a visual overview of their objectives.

![Aesthetic](https://img.shields.io/badge/Aesthetic-Cyberpunk-emerald)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![AI](https://img.shields.io/badge/AI-Enabled-purple)
![Written By](https://img.shields.io/badge/Written%20By-100%25%20AI%20Agent-orange)

> **Note:** This entire system was 100% written and architected by an AI Agent.

## 🚀 Key Features

- **Smart Command Palette**: Press `Cmd+K` (or `Ctrl+K`) to open the command center.
  - Type naturally: `Prepare documentation #work !high` to create a task.
  - Navigation: Type `>` followed by project name to jump between views.
- **Cyberpunk Aesthetics**: Immersive UI with scanlines, grid backgrounds, and monospaced typography.
- **Persistent Backend**: Powered by Node.js, Express, and SQLite. Your tasks stay where you left them.
- **AI Agent Friendly**: Built-in OpenAPI documentation and AI Skills guide for agentic integration.
- **Full Docker Support**: Deploy anywhere (Local, Proxmox, Cloud) with a single command.

## 🛠 Tech Stack

- **Frontend**: Vue 3, Vite, Tailwind CSS, Pinia, VueUse.
- **Backend**: Node.js, Express, SQLite (via `sqlite3` & `sqlite` wrapper).
- **Deployment**: Docker, Docker Compose, Nginx.
- **API Docs**: Swagger / OpenAPI 3.0.

## 🏁 Quick Start

### 1. Run with Docker (Recommended)
The easiest way to get the full system up and running with persistence:

```bash
docker-compose up -d --build
```
Access the app at: **`http://localhost:8080`**

### 2. Manual Development
If you want to run services manually for debugging:

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
npm install
npm run dev
```

## 🤖 AI Agent Integration

This system is designed to be managed by AI Agents.
- **Swagger Docs**: Access `http://localhost:8080/api-docs` to get the OpenAPI schema.
- **AI Guide**: Read `AI_AGENT_SKILLS.md` for detailed instructions on how an agent should use this system.

## 📁 Project Structure

- `src/`: Vue frontend components and state logic.
- `backend/src/`: Express API and SQLite database schema.
- `data/`: Local mounting point for the persistent database (in non-volume mode).
- `Dockerfile` & `docker-compose.yml`: Containerization logic.
- `nginx.conf`: Production routing and API proxy configuration.

## 📄 License
This project is open-source and free to use for your personal dev workflow.

---
*Built with passion for the Agentic Coding era.*
