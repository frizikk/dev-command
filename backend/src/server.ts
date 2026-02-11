import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function setupDb(dbPath: string) {
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            color TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            completed BOOLEAN NOT NULL DEFAULT 0,
            projectId TEXT,
            priority TEXT,
            createdAt INTEGER,
            FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE SET NULL
        );
    `);

    return db;
}

export function createApp(db: Database) {
    const app = express();
    app.use(cors());
    app.use(express.json());

    // OpenAPI definition
    const swaggerOptions = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'DevCommand AI API',
                version: '1.0.0',
                description: 'API for AI Agents to manage tasks and projects in the DevCommand system.',
            },
            servers: [
                {
                    url: 'http://localhost:3000',
                    description: 'Development server',
                },
            ],
        },
        apis: [path.resolve(__dirname, './server.ts')], // Path to the API docs
    };

    const swaggerSpec = swaggerJsdoc(swaggerOptions);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    /**
     * @openapi
     * /api/projects:
     *   get:
     *     summary: Retrieve a list of projects
     *     responses:
     *       200:
     *         description: A list of projects.
     */
    app.get('/api/projects', async (req, res) => {
        const projects = await db.all('SELECT * FROM projects');
        res.json(projects);
    });

    /**
     * @openapi
     * /api/projects:
     *   post:
     *     summary: Create a new project
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [id, name, color]
     *             properties:
     *               id: { type: string }
     *               name: { type: string }
     *               color: { type: string }
     *     responses:
     *       201:
     *         description: Project created.
     */
    app.post('/api/projects', async (req, res) => {
        const { id, name, color } = req.body;
        await db.run('INSERT INTO projects (id, name, color) VALUES (?, ?, ?)', [id, name, color]);
        res.status(201).json(req.body);
    });

    /**
     * @openapi
     * /api/projects/{id}:
     *   delete:
     *     summary: Delete a project
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string }
     *     responses:
     *       204:
     *         description: Project deleted.
     */
    app.delete('/api/projects/:id', async (req, res) => {
        await db.run('DELETE FROM projects WHERE id = ?', [req.params.id]);
        res.status(204).send();
    });

    /**
     * @openapi
     * /api/tasks:
     *   get:
     *     summary: Retrieve a list of tasks
     *     responses:
     *       200:
     *         description: A list of tasks.
     */
    app.get('/api/tasks', async (req, res) => {
        const tasks = await db.all('SELECT * FROM tasks');
        res.json(tasks.map((t: any) => ({ ...t, completed: !!t.completed })));
    });

    /**
     * @openapi
     * /api/tasks:
     *   post:
     *     summary: Create a new task
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [id, title]
     *             properties:
     *               id: { type: string }
     *               title: { type: string }
     *               completed: { type: boolean }
     *               projectId: { type: string }
     *               priority: { type: string, enum: [high, medium, low] }
     *               createdAt: { type: integer }
     *     responses:
     *       201:
     *         description: Task created.
     */
    app.post('/api/tasks', async (req, res) => {
        const { id, title, completed, projectId, priority, createdAt } = req.body;
        await db.run(
            'INSERT INTO tasks (id, title, completed, projectId, priority, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
            [id, title, completed ? 1 : 0, projectId, priority, createdAt]
        );
        res.status(201).json(req.body);
    });

    /**
     * @openapi
     * /api/tasks/{id}:
     *   put:
     *     summary: Update a task
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string }
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               title: { type: string }
     *               completed: { type: boolean }
     *               priority: { type: string, enum: [high, medium, low] }
     *     responses:
     *       200:
     *         description: Task updated.
     */
    app.put('/api/tasks/:id', async (req, res) => {
        const { title, completed, priority } = req.body;
        const currentTask = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
        if (!currentTask) return res.status(404).json({ error: 'Task not found' });

        const newTitle = title ?? currentTask.title;
        const newCompleted = completed !== undefined ? (completed ? 1 : 0) : currentTask.completed;
        const newPriority = priority ?? currentTask.priority;

        await db.run(
            'UPDATE tasks SET title = ?, completed = ?, priority = ? WHERE id = ?',
            [newTitle, newCompleted, newPriority, req.params.id]
        );
        res.json({ ...currentTask, title: newTitle, completed: !!newCompleted, priority: newPriority });
    });

    /**
     * @openapi
     * /api/tasks/{id}:
     *   delete:
     *     summary: Delete a task
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema: { type: string }
     *     responses:
     *       204:
     *         description: Task deleted.
     */
    app.delete('/api/tasks/:id', async (req, res) => {
        await db.run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
        res.status(204).send();
    });

    return app;
}
