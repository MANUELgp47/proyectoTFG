import { Router } from 'express';
import * as LikeMegustaController from '../controllers/likeMegusta.controller.js';
import {authMiddleware} from "../middleware/auth.middleware.js";

const router = Router();
// Obtener NUMERO TOTAL de likes de un recuerdo
router.get('/recuerdo/numero/:idRecuerdo', LikeMegustaController.getNumeroLikesRecuerdo);

// Obtener NUMERO TOTAL de likes de un comentario
router.get('/comentario/numero/:idComentario', LikeMegustaController.getNumeroLikesComentario);

//obtener todos los likes de la base de datos
router.get('/', LikeMegustaController.getLikesMegusta);

//Obtener si un Usuario dió like a un recuerdo
router.get('/recuerdo/:idRecuerdo/',authMiddleware, LikeMegustaController.getLikeMegustaPorIdRecuerdoYIdUsuario);
//Obtener si un Usuario dió like a un comentario
router.get('/comentario/:idComentario/',authMiddleware, LikeMegustaController.getLikeMegustaPorIdRecuerdoYIdUsuario);

//Obtener si un Usuario dió like a un comentario
//router.get('/comentario/:idComentario/usuario/:idUsuario', LikeMegustaController.getLikeMegustaPorIdComentarioYIdUsuario);

// Obtener todos los likes de un recuerdo
router.get('/recuerdo/:idRecuerdo', LikeMegustaController.getLikesMegustaPorIdRecuerdo);

// Obtener todos los likes de un comentario
router.get('/comentario/:idComentario', LikeMegustaController.getLikesMegustaPorIdComentario);

//crear un like
router.post('/', authMiddleware, LikeMegustaController.createLikeMegusta);

//eliminar un like
router.delete('/:idLike', authMiddleware, LikeMegustaController.deleteLikeMegusta);



export default router;