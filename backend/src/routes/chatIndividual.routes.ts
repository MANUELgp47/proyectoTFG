import { Router } from 'express';
import * as ChatIndividualController from '../controllers/chatIndividual.controller.js';
import {authMiddleware} from "../middleware/auth.middleware.js";

const router = Router();

// Obtener todos los chats individuales de la base de datos
router.get('/', ChatIndividualController.getChatsIndividual);


// Obtener un chat individual por id emisor o receptor
router.get('/:idUsuario', authMiddleware, ChatIndividualController.getChatIndividualPorUsuario);


//crear un chat individual ht
router.post('/:idReceptor',authMiddleware, ChatIndividualController.createChatIndividual);

//eliminar un chat individual por id
router.delete('/:id', ChatIndividualController.deleteChatIndividual);


export default router;