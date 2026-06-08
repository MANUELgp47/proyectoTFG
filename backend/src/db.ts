import './loadEnv.js';
import { Pool } from 'pg';


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

pool.connect((err, client, release) => {
    if (err) {
        console.error(' Error conectando a la base de datos:', err.stack);
    } else {
        console.log('¡Conexión a la base de datos exitosa!');
        release();
    }
});

//console.log(process.env.DB_HOST); // "localhost"
//console.log(process.env.DB_USER); // "admin"

export default pool;
