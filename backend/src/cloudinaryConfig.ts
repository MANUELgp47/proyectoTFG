import {v2 as cloudinary} from 'cloudinary';
import {CloudinaryStorage} from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config({path: './ini.env'});

// 1. Configuración de Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Faltan configuraciones de Cloudinary. Verifica las variables de entorno.');
}

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
});

// 2. Configuración del Almacenamiento (Cloudinary Storage)
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req: any, file: any) => {
        return {
            folder: 'tfg_actividades', // Nombre de la carpeta en Cloudinary
            allowed_formats: ['jpg', 'png', 'webp'],
            public_id: Date.now() + '-' + file.originalname.split('.')[0], // Nombre del archivo
        };
    },
});//esto puede subir varios archivos a la vez a cloudinary, multer se encarga de manejar la subida de varios archivos

export const upload = multer({storage: storage});
