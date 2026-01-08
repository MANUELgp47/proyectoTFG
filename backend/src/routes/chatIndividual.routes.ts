import { Router } from 'express';
import * as ChatIndividualController from '../controllers/chatIndividual.controller.js';

const router = Router();

// Obtener todos los chats individuales de la base de datos
router.get('/', ChatIndividualController.getChatsIndividual);

//crear un chat individual
router.post('/', ChatIndividualController.createChatIndividual);

//eliminar un chat individual por id
router.delete('/:id', ChatIndividualController.deleteChatIndividual);


export default router;