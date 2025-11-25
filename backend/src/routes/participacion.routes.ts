import { Router } from 'express';
import * as ParticipaciónController from '../controllers/participacion.controller.js';

const router = Router();

//Obtener todas las participaciones
router.get('/', ParticipaciónController.getParticipaciones);

//Crear una nueva participacion
router.post('/', ParticipaciónController.createParticipacion);

//actualiza estado participacion usamos idUsuario e idActividad en el body
router.put('/', ParticipaciónController.aceptarParticipacion);


//eliminar participacion
router.delete('/', ParticipaciónController.eliminarParticipacion);

export default router;