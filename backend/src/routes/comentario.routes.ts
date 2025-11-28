import { Router } from 'express';
import * as ComentarioController from '../controllers/comentario.controller.js';

const router = Router();

// Obtener todos los comentarios
router.get('/', ComentarioController.getComentarios);

// Obtener comentarios de un usuario
router.get('/usuario/:idUsuario', ComentarioController.getComentariosPorUsuario);

// Obtener comentarios de un recuerdo
router.get('/recuerdo/:idRecuerdo', ComentarioController.getComentariosPorRecuerdo);

// Crear un nuevo comentario
router.post('/', ComentarioController.createComentario);

// Borrar un comentario por su ID
router.delete('/:idComentario', ComentarioController.deleteComentario);

export default router;