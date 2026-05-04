/*
* Este archivo define el contexto de autenticación para la aplicación.
* Proporciona un AuthProvider que envuelve a los componentes que necesitan acceso a la autenticación,
* y un hook useAuth para acceder al contexto de autenticación desde cualquier componente.
* */

import { createContext, useContext, useEffect, useState } from "react";
import { getUserIdFromToken } from "../services/tokenUtils";
import { getUsuario } from "../services/usuarioService";
interface AuthContextType {
    token: string | null;
    idUsuario: number | null;
    rol: string | null;
    isAuthenticated: boolean;
    // aceptar string (token) o el objeto de respuesta que contiene token
    login: (tokenOrPayload: string | { token: string; [key: string]: any }) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const initialToken = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const [token, setToken] = useState<string | null>(initialToken);
    const [idUsuario, setIdUsuario] = useState<number | null>(getUserIdFromToken(initialToken));
    const [rol, setRol] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        let mounted = true;
        const fetchRol = async () => {
            if (idUsuario == null) return;
            setLoading(true);
            try {
                const usuario = await getUsuario(Number(idUsuario));
                if (!mounted) return;
                setRol(usuario?.rol ?? null);
            } catch (error) {
                console.error('Error al obtener usuario para rol:', error);
                if (mounted) setRol(null);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchRol();

        return () => { mounted = false; };
    }, [idUsuario]);

    // Ahora acepta token directo o el objeto response que contiene token
    const login = (tokenOrPayload: string | { token: string; [key: string]: any }) => {
        const newToken = typeof tokenOrPayload === 'string' ? tokenOrPayload : tokenOrPayload.token;

        // extraer id del token (el token sólo contiene id según tu nota)
        const id = getUserIdFromToken(newToken);

        if (newToken) {
            localStorage.setItem("token", newToken);
            setToken(newToken);
            setIdUsuario(id);

            if (id != null) {
                (async () => {
                    setLoading(true);
                    try {
                        const usuario = await getUsuario(Number(id));
                        setRol(usuario?.rol ?? null);
                    } catch (error) {
                        console.error('Error al obtener usuario tras login:', error);
                        setRol(null);
                    } finally {
                        setLoading(false);
                    }
                })();
            } else {
                setIdUsuario(null);
                setRol(null);
            }
        } else {
            // token inválido: limpiar estado
            localStorage.removeItem("token");
            setToken(null);
            setIdUsuario(null);
            setRol(null);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setIdUsuario(null);
        setRol(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                idUsuario,
                rol,
                isAuthenticated: !!token,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Sirve para usar el contexto en cualquier componente, si no se usa dentro de un AuthProvider lanza un error
//la linea siguiente es para evitar un error de react-refresh que no reconoce que esto no es un componente, sino un hook personalizado
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
    return context;
}
