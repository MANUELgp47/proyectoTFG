import { useAuth } from '../context/AuthContext';

// Función pura: decodifica un token JWT y devuelve idUsuario o null (no usa hooks)
export function getUserIdFromToken(token?: string | null): number | null {
    if (!token) return null;
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            Array.prototype.map.call(atob(base64), (c: string) => '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join('')
        );
        const payload = JSON.parse(jsonPayload);
        // Extraer y normalizar el idUsuario
        const rawId = payload?.idUsuario;
        const num = typeof rawId === 'number' ? rawId : (rawId != null ? Number(rawId) : NaN);
        // Consideramos válidos solo ids enteros positivos (> 0). Cualquier otro caso -> null
        if (!Number.isInteger(num) || num <= 0) return null;
        return num;
    } catch (e) {
        console.error('Error decodificando token:', e);
        return null;
    }
}

// Custom hook: devuelve el id del usuario de la sesión (o null si no hay token)
export const useIdSesionActual = (): number | null => {
    const { token } = useAuth();
    return getUserIdFromToken(token);
};
