/*
* Este archivo define el contexto de autenticación para la aplicación.
* Proporciona un AuthProvider que envuelve a los componentes que necesitan acceso a la autenticación,
* y un hook useAuth para acceder al contexto de autenticación desde cualquier componente.
* */

import { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
    loading: boolean;
}

// Contexto de autenticación para toda la app
const AuthContext = createContext<AuthContextType | undefined>(undefined);

//proveedor del contexto, da contexto a sus hijos
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);//token de autenticación, null si no hay token
    const [loading, setLoading] = useState(true);//indica si se está cargando el token desde localStorage

    // Al cargar la app mira si ya hay token guardado
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) setToken(storedToken);

        setLoading(false);
    }, []);

    // Funciones para login porque guardan el token en localStorage y en el estado,
    const login = (newToken: string) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
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