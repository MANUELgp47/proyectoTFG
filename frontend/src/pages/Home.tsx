import { useEffect, useState } from "react";
import { getActividades } from "../services/actividadService";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";



export default function Home() {
    const [actividades, setActividades] = useState<any[]>([]);
    const { isAuthenticated, idUsuario } = useAuth();

    const { logout } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getActividades();
                setActividades(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <h1>Actividades disponibles</h1>

            {!isAuthenticated && (
                <Link to="/login">
                    <button>Log in</button>
                </Link>
            )}

            {isAuthenticated && (
                <Link to="/actividad/crear">
                    <button>Crear actividad</button>
                </Link>
            )}
            {isAuthenticated && (
                <Link to="/notificaciones">
                    <button>Ver notificaciones</button>
                </Link>
            )}
            {isAuthenticated && (
                <Link to="/misActividades">
                    <button>Mis Actividades</button>
                </Link>
            )}
            {isAuthenticated && idUsuario != null && (
                <Link to={`/usuario/${idUsuario}`}>
                    <button>Mi perfil</button>
                </Link>
            )}

            {isAuthenticated && idUsuario != null && (

                    <button onClick={() => logout()}>
                    Logout</button>

            )}

            {actividades.map((act) => (
                <div key={act.idActividad ?? act.id}>
                    <a href={`/actividad/${act.idActividad}`}>{act.titulo}</a>
                    <p>{act.descripcion}</p>
                </div>
            ))}
        </div>

    );
}