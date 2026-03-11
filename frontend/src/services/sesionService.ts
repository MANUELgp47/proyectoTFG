import { useAuth } from '../context/AuthContext';

// Custom hook: devuelve el id del usuario de la sesión (o null si no hay token)
export const useIdSesionActual = (): number | null => {
    const { idUsuario } = useAuth();
    return idUsuario;
};
