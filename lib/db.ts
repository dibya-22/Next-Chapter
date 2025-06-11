// lib/db.ts
import { Pool } from 'pg';

// Database connection configuration
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 2000, // How long to wait for a connection
});

// Test connection
pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Database connection error:', err);
    // Attempt to reconnect
    setTimeout(() => {
        console.log('Attempting to reconnect to database...');
        pool.connect().catch(err => {
            console.error('Failed to reconnect:', err);
        });
    }, 5000);
});

// Helper function to check database connection
export const checkDatabaseConnection = async () => {
    try {
        const client = await pool.connect();
        client.release();
        return true;
    } catch (error) {
        console.error('Database connection check failed:', error);
        return false;
    }
};

export { pool };
export default pool;