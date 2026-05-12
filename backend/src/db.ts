import { Pool } from 'pg';
import dotenv from 'dotenv';

// Solo busca el archivo si NO estás en Railway (entorno local)
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '../ini.env' });
}

const pool = new Pool({
    connectionString:"postgresql://postgres.trwpfsgjpujzceznbnyl:MiPassDB_tfg@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
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
