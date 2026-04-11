import {useEffect, useState} from "react";
//import { useParams } from "react-router-dom";
import {getActividadesQueParticipo} from "../services/actividadService";
//import {useAuth} from "../context/AuthContext.tsx";

export default function MisActividades() {
    const [actividades, setActividades] = useState<any[]>([]);
    //   const { isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getActividadesQueParticipo();
                setActividades(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);

    //  if (loading) return <p>Cargando...</p>;

    return (
        <div>
            <h1>Mis Actividades</h1>

            {actividades.length === 0 ? (
                <p>No participas en ninguna actividad</p>
            ) : (
                actividades.map((act) => (
                    <div key={act.id}>
                        <h3><a href={`/actividad/${act.idActividad}`}>{act.titulo}</a></h3>

                        <p>{act.descripcion}</p>

                        <p>{act.estado}</p>
                     
                    </div>
                ))
            )}
        </div>
    );
}