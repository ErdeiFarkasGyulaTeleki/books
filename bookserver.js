import express from 'express';
import mysql from 'mysql2/promise'
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

const poolConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(poolConfig);

app.use(express.json());

app.get('/', (req, res) => {
    res.send("Üdv!")
})

app.get('/api/books', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM books');
        res.json(rows);
    } catch (error) {
        console.error("Error fetching books: ", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});