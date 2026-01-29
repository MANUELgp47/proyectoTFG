import { Router } from 'express';
import * as NotificaciónController from '../controllers/notificacion.controller.js';
import {authMiddleware} from "../middleware/auth.middleware.js";

const router = Router();

//Obtener todas las notificaciones
router.get('/', NotificaciónController.getNotificaciones);

//Obtener notificaciones por id de usuario
//http://localhost:3000/api/notificacion/usuario/1
router.get('/usuario/:idUsuario', NotificaciónController.getNotificacionesPorUsuario);

//Crear una nueva notificación TODO: ver si es necesario
router.post('/', NotificaciónController.createNotificacion);

//Actualizar una notificación por id
router.put('/:idNotificacion',authMiddleware, NotificaciónController.updateNotificacion);

//Eliminar notificación por id
router.delete('/:idNotificacion', authMiddleware, NotificaciónController.deleteNotificacion);

export default router;
