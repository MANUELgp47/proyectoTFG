/*
* Este archivo define el contexto de autenticación para la aplicación.
* Proporciona un AuthProvider que envuelve a los componentes que necesitan acceso a la autenticación,
* y un hook useAuth para acceder al contexto de autenticación desde cualquier componente.
* */

import { createContext, useContext, useState } from "react";
import { getUserIdFromToken } from "../services/tokenUtils";

interface AuthContextType {
    token: string | null;
    idUsuario: number | null;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
    loading: boolean;
}

// Contexto de autenticación para toda la app
const AuthContext = createContext<AuthContextType | undefined>(undefined);

//proveedor del contexto, da contexto a sus hijos
export function AuthProvider({ children }: { children: React.ReactNode }) {
    // inicialización síncrona desde localStorage para evitar renders intermedios
    const initialToken = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const [token, setToken] = useState<string | null>(initialToken);//token de autenticación, null si no hay token
    const [idUsuario, setIdUsuario] = useState<number | null>(getUserIdFromToken(initialToken));//id del usuario extraído del token, null si no hay token o el token es inválido
    const [loading] = useState(false);//ya hemos inicializado sincronamente


    // Funciones para login porque guardan el token en localStorage y en el estado,
    /*const login = (newToken: string) => {
        const id = getUserIdFromToken(newToken);
        if (id == null) {
            console.error('Token recibido en login no contiene idUsuario válido. Ignorando login.', { token: newToken });
            // asegúrate de limpiar el token por seguridad
            localStorage.removeItem('token');
            setToken(null);
            setIdUsuario(null);
            return;
        }
        localStorage.setItem("token", newToken);
        setToken(newToken);
        setIdUsuario(id);
    };*/

    const login = (newToken: string) => {
        localStorage.setItem("token", newToken);

        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setIdUsuario(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                idUsuario,
                isAuthenticated: !!token,//si hay token, el usuario está autenticado
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
