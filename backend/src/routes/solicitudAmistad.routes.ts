import { Router } from 'express';
import * as SolicitudAmistadController from '../controllers/solicitudAmistad.controller.js';
import {authMiddleware} from "../middleware/auth.middleware.js";

const router = Router();

// Obtener todas las solicitudes de amistad
router.get('/', SolicitudAmistadController.getAllSolicitudesAmistad);

//Obtener una solicitud de amistad por receptor
router.get('/receptor/:idReceptor', SolicitudAmistadController.getSolicitudesPorReceptor);

//crear una nueva solicitud de amistad
router.post('/:idReceptor', authMiddleware, SolicitudAmistadController.crearSolicitudAmistad);

//actualizar el estado de una solicitud de amistad
router.put('/:idUsuarioEmisor', authMiddleware, SolicitudAmistadController.actualizarEstadoSolicitudAmistad);

//eliminar una solicitud de amistad
router.delete('/:idUsuarioEmisor', authMiddleware, SolicitudAmistadController.eliminarSolicitudAmistad);


export default router;