import { Router } from 'express';
import * as LikeMegustaController from '../controllers/likeMegusta.controller.js';

const router = Router();
// Obtener NUMERO TOTAL de likes de un recuerdo
router.get('/recuerdo/numero/:idRecuerdo', LikeMegustaController.getNumeroLikesRecuerdo);

// Obtener NUMERO TOTAL de likes de un comentario
router.get('/comentario/numero/:idComentario', LikeMegustaController.getNumeroLikesComentario);

//obtener todos los likes de la base de datos
router.get('/', LikeMegustaController.getLikesMegusta);

// Obtener todos los likes de un recuerdo
router.get('/recuerdo/:idRecuerdo', LikeMegustaController.getLikesMegustaPorIdRecuerdo);

// Obtener todos los likes de un comentario
router.get('/comentario/:idComentario', LikeMegustaController.getLikesMegustaPorIdComentario);

//crear un like
router.post('/', LikeMegustaController.createLikeMegusta);

//eliminar un like
router.delete('/:idLike', LikeMegustaController.deleteLikeMegusta);



export default router;