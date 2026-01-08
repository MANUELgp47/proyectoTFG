import { Router } from 'express';
import * as ChatActividadController from '../controllers/chatActividad.controller.js';

const router = Router();

// Obtener todos los chats de actividad de la base de datos
router.get('/', ChatActividadController.getChatsActividad);

//Obtiene el chat de actividad por id de actividad
router.post('/actividad', ChatActividadController.getChatPorActividad);

//crear un chat de actividad
router.post('/', ChatActividadController.createChatActividad);


export default router;