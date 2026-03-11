// Utilidad pura para extraer idUsuario de un token JWT sin usar hooks
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
        const rawId = payload?.idUsuario;
        const num = typeof rawId === 'number' ? rawId : (rawId != null ? Number(rawId) : NaN);
        if (!Number.isInteger(num) || num <= 0) return null;
        return num;
    } catch (e) {
        console.error('Error decodificando token:', e);
        return null;
    }
}
