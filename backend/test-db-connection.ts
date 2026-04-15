import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function testConnection() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Connection successful!');
    console.log('Current time from database:', result.rows[0]);
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Connection failed:', error);
    await pool.end();
    process.exit(1);
  }
}

testConnection();
