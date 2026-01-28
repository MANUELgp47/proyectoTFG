import { Router } from 'express';
import * as MensajeController from '../controllers/mensaje.controller.js';
import {authMiddleware} from "../middleware/auth.middleware.js";

const router = Router();

// ver todos los mensajes
router.get('/', MensajeController.getMensajes);

//crear un mensaje
router.post('/', authMiddleware, MensajeController.createMensaje);


//eliminar un mensaje por id
router.delete('/:id', authMiddleware, MensajeController.deleteMensaje);

//actualizar un mensaje por id TODO: implementar en el controlador
router.put('/:id', authMiddleware, MensajeController.updateMensaje);


export default router;