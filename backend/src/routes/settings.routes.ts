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

//lo he bloqueado?
router.get('/loHeBloqueado/:idUsuario', authMiddleware, SettingsController.getloHeBloqueado);

//me ha bloqueado?
router.get('/meHaBloqueado/:idUsuario', authMiddleware, SettingsController.getmeHaBloqueado);

//verificar correo solicitud (Este es el que envia el correo con el codigo de verificacion)
router.post('/verificarCorreo', authMiddleware, SettingsController.verificarCorreo);

//recibe codigo de verificacion y lo verifica
router.post('/verificarCorreoCodigo/:codigo', authMiddleware, SettingsController.verificarCorreoCodig);

export default router;