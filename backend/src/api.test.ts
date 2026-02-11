import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp, setupDb } from './server.js';
import { Database } from 'sqlite';
import fs from 'fs';
import path from 'path';

describe('DevCommand API', () => {
    let app: any;
    let db: Database;
    const testDbPath = path.resolve(__dirname, '../test.sqlite');

    beforeAll(async () => {
        // Clean up old test db if exists
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
        db = await setupDb(testDbPath);
        app = createApp(db);
    });

    afterAll(async () => {
        await db.close();
        if (fs.existsSync(testDbPath)) {
            fs.unlinkSync(testDbPath);
        }
    });

    it('should create a project', async () => {
        const res = await request(app)
            .post('/api/projects')
            .send({
                id: 'p1',
                name: 'Test Project',
                color: 'blue'
            });
        expect(res.status).toBe(201);
        expect(res.body.name).toBe('Test Project');
    });

    it('should list projects', async () => {
        const res = await request(app).get('/api/projects');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
    });

    it('should create a task', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .send({
                id: 't1',
                title: 'Test Task',
                completed: false,
                projectId: 'p1',
                priority: 'high',
                createdAt: Date.now()
            });
        expect(res.status).toBe(201);
        expect(res.body.title).toBe('Test Task');
    });

    it('should list tasks', async () => {
        const res = await request(app).get('/api/tasks');
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].title).toBe('Test Task');
    });

    it('should update a task', async () => {
        const res = await request(app)
            .put('/api/tasks/t1')
            .send({
                completed: true
            });
        expect(res.status).toBe(200);
        expect(res.body.completed).toBe(true);
    });

    it('should delete a task', async () => {
        const res = await request(app).delete('/api/tasks/t1');
        expect(res.status).toBe(204);

        const check = await request(app).get('/api/tasks');
        expect(check.body.length).toBe(0);
    });

    it('should return 404 when updating non-existent task', async () => {
        const res = await request(app)
            .put('/api/tasks/non-existent')
            .send({ title: 'Fail' });
        expect(res.status).toBe(404);
        expect(res.body.error).toBe('Task not found');
    });

    it('should handle malformed JSON gracefully', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .set('Content-Type', 'application/json')
            .send('{"invalid": json'); // Manually send malformed string
        expect(res.status).toBe(400);
    });
});
