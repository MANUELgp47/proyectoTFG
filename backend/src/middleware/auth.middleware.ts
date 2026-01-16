import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    idUsuario: number;
}

// Extender Request para añadir userId
declare global {
    namespace Express {
        interface Request {
            userId?: number;
        }
    }
}

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({mensaje: 'Token no proporcionado'});
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({mensaje: 'Token mal formado'});
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as JwtPayload;

        req.userId = decoded.idUsuario;
        next();
    } catch (error) {
        return res.status(401).json({mensaje: 'Token inválido o expirado'});
    }
};
