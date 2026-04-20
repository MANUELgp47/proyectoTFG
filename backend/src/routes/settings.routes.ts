import { Router } from 'express';
import * as SettingsController from '../controllers/settings.controller.js';
import {authMiddleware} from "../middleware/auth.middleware.js";
import * as ActividadController from "../controllers/actividad.controller.js";

const router = Router();

//Obtener mis settings
router.get('/', authMiddleware, SettingsController.getMySettings);

//Obtener la privacidad de un usuario
router.get('/privacidad/:idUsuario', authMiddleware, SettingsController.getMyPrivacy);

//Actualizar mis settings
router.put('/', authMiddleware, SettingsController.actualizarSettings);

export default router;