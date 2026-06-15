import { Router } from 'express';
import * as ChatIndividualController from '../controllers/chatIndividual.controller.js';
import {authMiddleware} from "../middleware/auth.middleware.js";

const router = Router();

// Obtener todos los chats individuales de la base de datos dev
//router.get('/', ChatIndividualController.getChatsIndividual);


// Obtener un chat individual por id emisor o receptor
router.get('/:idUsuario', authMiddleware, ChatIndividualController.getChatIndividualPorUsuario);

//obtener todos mis chats
router.get('/chats/mios', authMiddleware, ChatIndividualController.getMisChatsIndividual);

//existe chat entre dos usuarios
router.get('/existe/:idUsuario1', authMiddleware, ChatIndividualController.existeChatEntreUsuarios);

// Obtener un chat individual por id de chat individual
router.get('/id/:idChatIndividual', authMiddleware, ChatIndividualController.getChatIndividualPorId);

//crear un chat individual ht
router.post('/:idReceptor',authMiddleware, ChatIndividualController.createChatIndividual);

//eliminar un chat individual por id
router.delete('/:id', ChatIndividualController.deleteChatIndividual);


export default router;