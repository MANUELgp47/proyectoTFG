import { Router } from 'express';
import * as MensajeController from '../controllers/mensaje.controller.js';
import {authMiddleware} from "../middleware/auth.middleware.js";
import {getMensajesPorChatActividad} from "../controllers/mensaje.controller.js";

const router = Router();

// ver todos los mensajes
router.get('/', MensajeController.getMensajes);

//crear un mensaje
router.post('/', authMiddleware, MensajeController.createMensaje);

//get mensajes de un chat individual por id del chat
router.get('/chat/:idChatIndividual', authMiddleware, MensajeController.getMensajesPorChatIndividual);

//
router.get('/chatActividad/:idChatActividad', authMiddleware, MensajeController.getMensajesPorChatActividad);

//marcar un mensaje como leido por id en chats individuales
router.put('/:idMensaje', authMiddleware, MensajeController.marcarMensajeComoLeidoIndividual);

//eliminar un mensaje por id
router.delete('/:id', authMiddleware, MensajeController.deleteMensaje);

//actualizar un mensaje por id TODO: implementar en el controlador
router.put('/:id', authMiddleware, MensajeController.updateMensaje);


export default router;