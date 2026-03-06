import { useEffect, useState } from "react";
import { getActividades } from "../services/actividadService";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useIdSesionActual } from "../services/sesionService";

export default function Home() {
    const [actividades, setActividades] = useState<any[]>([]);
    const { isAuthenticated } = useAuth();
    const idSesion =useIdSesionActual();

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
            {isAuthenticated && (
                <Link to={`/usuario/${idSesion}`}>
                    <button>Mi perfil</button>
                </Link>
            )}
          

            {actividades.map((act) => (
                <div key={act.id}>
                    <a href={`/actividad/${act.idActividad}`}>{act.titulo}</a>
                    <p>{act.descripcion}</p>
                </div>
            ))}
        </div>

    );
}