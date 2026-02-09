import express from 'express';
const app = express();
app.get('/', (req, res) => res.send('OK'));
app.listen(3001, () => {
    console.log('Test server on 3001');
});
setInterval(() => { }, 1000); // Force keep-alive
