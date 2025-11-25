import { Router } from 'express';
import * as ActividadController from '../controllers/actividad.controller.js';

const router = Router();

//Obtener todas las actividades
router.get('/', ActividadController.getActividades);

//Crear una nueva actividad
router.post('/', ActividadController.createActividad);

//Actualizar una actividad existente
router.put('/:id', ActividadController.updateActividad);

//Eliminar una actividad
router.delete('/:id', ActividadController.deleteActividad);

export default router;