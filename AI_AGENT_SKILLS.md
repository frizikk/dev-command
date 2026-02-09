# AI Agent Skills: DevCommand System

This document describes the "skills" (tools) available for an AI Agent to interact with the DevCommand Task Management System.

## Base URL
`http://localhost:3000/api`

## OpenAPI Specification
The full technical schema is available at:
`http://localhost:3000/api-docs`

---

## Skill: Task Management

### 1. List Tasks
**Purpose:** Retrieve all current tasks to understand what's pending or completed.
- **Endpoint:** `GET /tasks`
- **Output:** Array of task objects.

### 2. Create Task
**Purpose:** Add a new objective to the system.
- **Endpoint:** `POST /tasks`
- **Payload:**
  ```json
  {
    "id": "unique-uuid-or-timestamp",
    "title": "Clean description of the task",
    "completed": false,
    "projectId": "id-of-the-project",
    "priority": "high" | "medium" | "low",
    "createdAt": 1707510000000
  }
  ```

### 3. Update Task Status
**Purpose:** Mark a task as completed or change its priority/title.
- **Endpoint:** `PUT /tasks/{id}`
- **Payload:** Any partial task object.

### 4. Delete Task
**Purpose:** Remove a task from the system.
- **Endpoint:** `DELETE /tasks/{id}`

---

## Skill: Project Management

### 1. List Projects
**Purpose:** See all active projects/categories.
- **Endpoint:** `GET /projects`

### 2. Manage Projects
**Purpose:** Create (`POST`) or Delete (`DELETE`) projects to organize tasks better.
- **Defaults:** Use colors like `blue`, `emerald`, `red`, `yellow`, `purple`.

---

## System Prompt for AI Agent
If you are configuring an AI Agent to use this system, you can use the following system prompt:

> "You are a Task Management Assistant. Your goal is to help the user manage their DevCommand dashboard. You have access to a REST API. 
> When the user gives you a request like 'Add a high priority task to the Work project', you should first list projects to find the 'Work' ID, and then call the create task endpoint.
> Always verify the current state by listing tasks before making major changes."

## Example Flow
1. **User:** "What's on my plate today?"
2. **Agent:** Calls `GET /tasks`
3. **Agent:** "You have 3 pending tasks: 'Fix CSS bug', 'Prepare Dockerfile', and 'Initial Commit'."
4. **User:** "Mark the CSS bug as done."
5. **Agent:** Calls `PUT /tasks/{id}` with `completed: true`
6. **Agent:** "Done! 'Fix CSS bug' is now completed."
