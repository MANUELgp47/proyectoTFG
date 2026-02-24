import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type {JSX} from "react";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
    const { isAuthenticated, loading  } = useAuth();

    if (loading) {
        return <p>Cargando...</p>;
    }

    // Si no está autenticado -> redirige a login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Si está autenticado -> deja pasar
    return children;
}