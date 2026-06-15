import { Router } from 'express';
import * as NotificaciónController from '../controllers/notificacion.controller.js';
import {authMiddleware} from "../middleware/auth.middleware.js";

const router = Router();

//Obtener todas las notificaciones dev
//router.get('/', NotificaciónController.getNotificaciones);

//Obtener notificaciones por id de usuario
//http://localhost:3000/api/notificacion/usuario/1
router.get('/mias', authMiddleware, NotificaciónController.getNotificacionesPorUsuario);

//Obtener una notificación por id
router.get('/:idNotificacion', authMiddleware, NotificaciónController.getNotificacionById);

//Crear una nueva notificación TODO: ver si es necesario
router.post('/', NotificaciónController.createNotificacion);


//crear una Denuncia
router.post('/denuncia', authMiddleware, NotificaciónController.createDenuncia);


//Actualizar una notificación por id
router.put('/:idNotificacion',authMiddleware, NotificaciónController.updateNotificacion);

//Eliminar notificación por id
router.delete('/:idNotificacion', authMiddleware, NotificaciónController.deleteNotificacion);

export default router;
