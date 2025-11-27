
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import pool from './db.js'; // usa .js para importar el archivo db.ts porque es un módulo de Node.js
import usuarioRoutes from './routes/usuario.routes.js';
import actividadRoutes from './routes/actividad.routes.js';
import participacionRoutes from './routes/participacion.routes.js';
import notificacionRoutes from './routes/notificacion.routes.js';
import recuerdoRoutes from './routes/recuerdo.routes.js';



const app = express();

app.use(cors()); // Permite todas las conexiones CORS desde otros puertos y dominios. para permitir al frondend acceder al backend
app.use(express.json());// Middleware para parsear JSON y que Express pueda entender los datos en formato

//rutas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/actividades', actividadRoutes);
app.use('/api/participacion', participacionRoutes);
app.use('/api/notificacion', notificacionRoutes);
app.use('/api/recuerdos', recuerdoRoutes);






//get para probar la conexión a la base de datos
app.get('/test-db', async (req, res) => {
    try {
        console.log('Conectando a la base de datos...');
        const result = await pool.query('SELECT NOW()');
        res.json(result.rows);// Envía los resultados como JSON res es el objeto de respuesta
        console.log(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en la base de datos');

    }
});

app.listen(3000, () => {
    console.log('Servidor escuchando en puerto 3000');
});