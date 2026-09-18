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
});

app.get('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error("Error fetching books: ", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/api/books', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM books');
        res.json(rows);
    } catch (error) {
        console.error("Error fetching books: ", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/books', async (req, res) => {
    try {
        const { title, author, pages, available } = req.body;
        const result = await pool.query('INSERT INTO books (title, author, pages, available) VALUES (?, ?, ?, ?)', [title, author, pages, available]);
        res.status(201).json({ message: 'Product added successfully ', productId: result.insertId, title, author, pages, available});
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, pages, available } = req.body;

        const [result] = await pool.query('UPDATE books SET title = ?, author = ?, pages = ?, available = ? WHERE id = ?', [title, author, pages, available, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ id, title, author, pages, available });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});