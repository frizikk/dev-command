import { createApp, setupDb } from './server.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../../data/database.sqlite');
console.log('Target database path:', dbPath);

(async () => {
    try {
        const db = await setupDb(dbPath);
        console.log('Database initialized');

        const app = createApp(db);

        const PORT = 3000;
        app.listen(PORT, () => {
            console.log(`Backend running at http://localhost:${PORT}`);
            console.log(`AI Agent Documentation: http://localhost:${PORT}/api-docs`);
        });
    } catch (err) {
        console.error('SERVER ERROR:', err);
        process.exit(1);
    }
})();
