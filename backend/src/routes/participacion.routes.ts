import { Router } from 'express';
import * as ParticipaciónController from '../controllers/participacion.controller.js';
import {authMiddleware} from "../middleware/auth.middleware.js";

const router = Router();

//Obtener todas las participaciones
router.get('/', ParticipaciónController.getParticipaciones);

//Obtener participaciones por usuario
//router.get('/misParticipaciones/', authMiddleware, ParticipaciónController.getParticipacionesPorUsuario);

//Crear una nueva participacion
router.post('/', authMiddleware, ParticipaciónController.createParticipacion);

//actualiza estado participacion usamos idUsuario e idActividad en el body y El token del usuario que acepta (idCreador)
router.put('/', authMiddleware, ParticipaciónController.actualizaEstado);

//eliminar participacion
router.delete('/', authMiddleware, ParticipaciónController.eliminarParticipacion);

export default router;