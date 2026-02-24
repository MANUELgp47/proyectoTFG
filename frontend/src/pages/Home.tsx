import { useEffect, useState } from "react";
import { getActividades } from "../services/actividadService";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Home() {
    const [actividades, setActividades] = useState<any[]>([]);
    const { isAuthenticated } = useAuth();

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
                <Link to="/crear">
                    <button>Crear actividad</button>
                </Link>
            )}

            {actividades.map((act) => (
                <div key={act.id}>
                    <h3>{act.titulo}</h3>
                    <p>{act.descripcion}</p>
                </div>
            ))}
        </div>
    );
}