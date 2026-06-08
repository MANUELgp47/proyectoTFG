import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
if (process.env.NODE_ENV !== 'production') {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // Resuelve la ruta al archivo ini.env en el directorio backend
    const envPath = resolve(__dirname, '../ini.env');

    const result = dotenv.config({ path: envPath });

    if (result.error) {
        console.warn(`[loadEnv] No se pudo cargar el archivo ini.env desde ${envPath}:`, result.error.message);
    } else {
        console.log(`[loadEnv] Variables de entorno cargadas con éxito desde ${envPath}`);
    }
} else {
    console.log('[loadEnv] Ejecutando en producción (Railway). Se utilizarán las variables del sistema.');
}
