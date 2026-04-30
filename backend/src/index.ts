import express, {type Request, type Response} from 'express';
import cors from 'cors';
import path from 'path';
import pool from './db.js'; // usa .js para importar el archivo db.ts porque es un módulo de Node.js
import usuarioRoutes from './routes/usuario.routes.js';
import actividadRoutes from './routes/actividad.routes.js';
import participacionRoutes from './routes/participacion.routes.js';
import notificacionRoutes from './routes/notificacion.routes.js';
import recuerdoRoutes from './routes/recuerdo.routes.js';
import amistadRoutes from "./routes/amistad.routes.js";
import solicitudAmistadRoutes from "./routes/solicitudAmistad.routes.js";
import comentarioRoutes from "./routes/comentario.routes.js";
import likeRoutes from "./routes/likeMegusta.routes.js";
import mensajeRoutes from "./routes/mensaje.routes.js";
import chatIndividualRoutes from "./routes/chatIndividual.routes.js";
import chatActividadRoutes from "./routes/chatActividad.routes.js";
import authRoutes from "./auth/auth.routes.js";
import tagRoutes from "./routes/tag.routes.js";
import actividadTagRoutes from "./routes/actividadTag.routes.js";
import settingRoutes from "./routes/settings.routes.js";

//imagenes
import { fileURLToPath } from 'url';
import  { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors()); // Permite todas las conexiones CORS desde otros puertos y dominios. para permitir al frondend acceder al backend
app.use(express.json());// Middleware para parsear JSON y que Express pueda entender los datos en formato

//rutas
app.use('/api/usuario', usuarioRoutes);
app.use('/api/actividad', actividadRoutes);
app.use('/api/participacion', participacionRoutes);
app.use('/api/notificacion', notificacionRoutes);
app.use('/api/recuerdo', recuerdoRoutes);
app.use('/api/amistad', amistadRoutes);
app.use('/api/solicitudAmistad', solicitudAmistadRoutes);
app.use('/api/comentario', comentarioRoutes);
app.use('/api/likeMegusta', likeRoutes);
app.use('/api/mensaje', mensajeRoutes);
app.use('/api/chatIndividual', chatIndividualRoutes);
app.use('/api/chatActividad', chatActividadRoutes);
app.use('/api/tag',tagRoutes);
app.use('/api/actividadtag', actividadTagRoutes);
app.use('/api/auth/', authRoutes);
app.use('/api/settings', settingRoutes);
//fotos
app.use('/api/uploads', express.static(path.join(__dirname, './uploads')));

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