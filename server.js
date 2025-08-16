const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Create table if it doesn't exist
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );
`;
pool.query(createTableQuery)
    .then(() => console.log('Payments table ready'))
    .catch(err => console.error('Error creating table:', err));

// API endpoint to submit payment
app.post('/api/submit-payment', async (req, res) => {
    const { name, phone, amount } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO payments(name, phone, amount) VALUES($1, $2, $3) RETURNING *',
            [name, phone, amount]
        );
        res.status(201).json({ message: 'Payment submitted', data: result.rows[0] });
    } catch (err) {
        console.error('Database insertion error:', err);
        res.status(500).json({ message: 'Error submitting payment', error: err.message });
    }
});

// API endpoint to get all payments
app.get('/api/get-payments', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM payments ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ message: 'Error fetching payments', error: err.message });
    }
});

// This is an example of a simple route for testing, it is not serving HTML.
app.get('/', (req, res) => {
    res.send('Backend is running!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});