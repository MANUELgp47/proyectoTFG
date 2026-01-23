import { Router } from 'express';
import * as ActividadController from '../controllers/actividad.controller.js';
import {finalizarActividad} from "../controllers/actividad.controller.js";
import {authMiddleware} from "../middleware/auth.middleware.js";

const router = Router();

//Obtener todas las actividades
router.get('/', ActividadController.getActividades);

//Crear una nueva actividad
router.post('/', authMiddleware, ActividadController.createActividad);

//Actualizar una actividad existente
router.put('/:id', authMiddleware,  ActividadController.updateActividad);

//Eliminar una actividad
router.delete('/:id', authMiddleware, ActividadController.deleteActividad);

//finalizar una actividad
router.post('/:id/finalizar', authMiddleware, ActividadController.finalizarActividad);

export default router;