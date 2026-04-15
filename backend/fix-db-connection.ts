import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function fixConnection() {
  console.log('Testing different connection methods...\n');

  // Method 1: Using connection string
  console.log('Method 1: Connection String');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  try {
    const pool1 = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const result1 = await pool1.query('SELECT NOW()');
    console.log('✅ Connection string works!');
    console.log('Current time:', result1.rows[0].now);
    await pool1.end();
  } catch (error: any) {
    console.log('❌ Connection string failed:', error.message);
  }

  console.log('\n---\n');

  // Method 2: Using individual parameters
  console.log('Method 2: Individual Parameters');
  
  try {
    const pool2 = new Pool({
      host: 'localhost',
      port: 5432,
      database: 'peaform',
      user: 'postgres',
      password: 'Indofood00',
    });
    const result2 = await pool2.query('SELECT NOW()');
    console.log('✅ Individual parameters work!');
    console.log('Current time:', result2.rows[0].now);
    await pool2.end();
    
    console.log('\n✅ SOLUTION: Use individual parameters');
    console.log('\nUpdate your backend/src/db/index.ts to use:');
    console.log(`
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'peaform',
  user: 'postgres',
  password: 'Indofood00',
});
    `);
  } catch (error: any) {
    console.log('❌ Individual parameters failed:', error.message);
  }

  process.exit(0);
}

fixConnection();
