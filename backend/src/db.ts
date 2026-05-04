import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '../ini.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
    max: 10,
    idleTimeoutMillis: 30000,
  /* host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,*/
});

//console.log(process.env.DB_HOST); // "localhost"
//console.log(process.env.DB_USER); // "admin"

export default pool;
