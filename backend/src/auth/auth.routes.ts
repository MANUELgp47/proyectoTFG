import { Router } from 'express';
import * as AuthController from './auth.controller.js';

const router = Router();

//Login
router.post('/login', AuthController.login);


export default router;