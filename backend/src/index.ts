import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Path to database file
const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../../data/database.sqlite');
console.log('Target database path:', dbPath);

async function setupDb() {
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

(async () => {
    try {
        const db = await setupDb();
        console.log('Database initialized');

        // Projects API
        app.get('/api/projects', async (req, res) => {
            const projects = await db.all('SELECT * FROM projects');
            res.json(projects);
        });

        app.post('/api/projects', async (req, res) => {
            const { id, name, color } = req.body;
            await db.run('INSERT INTO projects (id, name, color) VALUES (?, ?, ?)', [id, name, color]);
            res.status(201).json(req.body);
        });

        app.delete('/api/projects/:id', async (req, res) => {
            await db.run('DELETE FROM projects WHERE id = ?', [req.params.id]);
            res.status(204).send();
        });

        // Tasks API
        app.get('/api/tasks', async (req, res) => {
            const tasks = await db.all('SELECT * FROM tasks');
            // SQLite returns 0/1 for booleans
            res.json(tasks.map((t: any) => ({ ...t, completed: !!t.completed })));
        });

        app.post('/api/tasks', async (req, res) => {
            const { id, title, completed, projectId, priority, createdAt } = req.body;
            await db.run(
                'INSERT INTO tasks (id, title, completed, projectId, priority, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
                [id, title, completed ? 1 : 0, projectId, priority, createdAt]
            );
            res.status(201).json(req.body);
        });

        app.put('/api/tasks/:id', async (req, res) => {
            const { title, completed, priority } = req.body;
            const currentTask = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
            if (!currentTask) return res.status(404).send();

            const newTitle = title ?? currentTask.title;
            const newCompleted = completed !== undefined ? (completed ? 1 : 0) : currentTask.completed;
            const newPriority = priority ?? currentTask.priority;

            await db.run(
                'UPDATE tasks SET title = ?, completed = ?, priority = ? WHERE id = ?',
                [newTitle, newCompleted, newPriority, req.params.id]
            );
            res.json({ ...currentTask, title: newTitle, completed: !!newCompleted, priority: newPriority });
        });

        app.delete('/api/tasks/:id', async (req, res) => {
            await db.run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
            res.status(204).send();
        });

        const PORT = 3000;
        app.listen(PORT, () => {
            console.log(`Backend running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('SERVER ERROR:', err);
        process.exit(1);
    }
})();
