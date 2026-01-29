import { Router } from 'express';
import * as ActividadTagController from '../controllers/actividadTag.controller.js';

const router = Router();

//Obtener todos los tags
router.get('/', ActividadTagController.getTodosActividadTags);

//asignar un tag a una actividad
router.post('/', ActividadTagController.createActividadTag);

//eliminar un tag de una actividad
router.delete('/', ActividadTagController.deleteActividadTag);

export default router;
