import { Router } from 'express';
import * as ActividadTagController from '../controllers/actividadTag.controller.js';
import {authMiddleware} from "../middleware/auth.middleware.js";

const router = Router();

//Obtener todos los tags
router.get('/', ActividadTagController.getTodosActividadTags);

//asignar un tag a una actividad
router.post('/',authMiddleware, ActividadTagController.createActividadTag);

//eliminar un tag de una actividad
router.delete('/',authMiddleware, ActividadTagController.deleteActividadTag);

export default router;
