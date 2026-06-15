import { Router } from 'express';
import * as ChatActividadController from '../controllers/chatActividad.controller.js';
import {authMiddleware} from "../middleware/auth.middleware.js";

const router = Router();

//TODO en principio los usuarios no tendran acceso a esas rutas así que no se añade el middleware de autenticación

// Obtener todos los chats de actividad de la base de datos dev
//router.get('/', ChatActividadController.getChatsActividad);

//Obtiene el chat de actividad por id de actividad
router.get('/actividad/:idActividad', authMiddleware, ChatActividadController.getChatPorActividad);

//obtener el chatActividad por su id de chatActividad
router.get('/id/:idChatActividad', authMiddleware, ChatActividadController.getChatActividadPorId);

//obtener todos mis chats de actividad
router.get('/chats/mios', authMiddleware, ChatActividadController.getMisChatsActividad);

//crear un chat de actividad
router.post('/',  ChatActividadController.createChatActividad);


export default router;