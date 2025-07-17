import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Error acquiring client from pool:', err.stack);
    } else {
        client.query('SELECT NOW()', (queryErr, result) => {
            release();
            if (queryErr) {
                console.error('Error executing initial query:', queryErr.stack);
            } else {
                console.log('Successfully connected to Supabase PostgreSQL at:', result.rows[0].now);
            }
        });
    }
});

export default pool;