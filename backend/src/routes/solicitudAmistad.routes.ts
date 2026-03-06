import { Router } from 'express';
import * as SolicitudAmistadController from '../controllers/solicitudAmistad.controller.js';
import {authMiddleware} from "../middleware/auth.middleware.js";
import {getSolicitudAmistad} from "../controllers/solicitudAmistad.controller.js";

const router = Router();

// Obtener todas las solicitudes de amistad
router.get('/', SolicitudAmistadController.getAllSolicitudesAmistad);

//Obtener una solicitud de amistad por receptor TODO: borrar esto o cambiarlo a authMiddleware
router.get('/receptor/:idReceptor', SolicitudAmistadController.getSolicitudesPorReceptor);

//comprueba si ya he mandado solicitud al usuario
router.get('/entre/:idReceptor', authMiddleware, SolicitudAmistadController.getSolicitudAmistad);

//crear una nueva solicitud de amistad
router.post('/:idReceptor', authMiddleware, SolicitudAmistadController.crearSolicitudAmistad);

//actualizar el estado de una solicitud de amistad
router.put('/:idUsuarioEmisor', authMiddleware, SolicitudAmistadController.actualizarEstadoSolicitudAmistad);

//eliminar una solicitud de amistad
router.delete('/:idUsuarioEmisor', authMiddleware, SolicitudAmistadController.eliminarSolicitudAmistad);


export default router;