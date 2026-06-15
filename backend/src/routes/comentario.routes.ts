import { Router } from 'express';
import * as ComentarioController from '../controllers/comentario.controller.js';
import {authMiddleware} from "../middleware/auth.middleware.js";

const router = Router();

// Obtener todos los comentarios dev
//router.get('/', ComentarioController.getComentarios);

// Obtener comentarios de un usuario
router.get('/usuario/:idUsuario', ComentarioController.getComentariosPorUsuario);

// Obtener comentarios de un recuerdo
router.get('/recuerdo/:idRecuerdo', ComentarioController.getComentariosPorRecuerdo);

// Crear un nuevo comentario
router.post('/', authMiddleware, ComentarioController.createComentario);

// Borrar un comentario por su ID
router.delete('/:idComentario', authMiddleware, ComentarioController.deleteComentario);

export default router;