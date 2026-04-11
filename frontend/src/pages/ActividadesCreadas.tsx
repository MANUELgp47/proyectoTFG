import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getActividadesPorUsuario } from "../services/actividadService";

export default function ActividadesCreadas() {
    const { id } = useParams();
    const [actividades, setActividades] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (id) {
                    const data = await getActividadesPorUsuario(Number(id));
                    setActividades(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) return <p>Cargando...</p>;

    return (
        <div>
            <h1>Actividades creadas por el usuario {id}</h1>

            {actividades.length === 0 ? (
                <p>Este usuario no ha creado actividades.</p>
            ) : (
                actividades.map((act) => (
                    <div key={act.id}>
                        <h3>{act.titulo}</h3>
                        <p>{act.descripcion}</p>
                        <a href={`/actividad/${act.idActividad}`}>{act.titulo}</a>
                        <p>{act.estado}</p>
                    </div>
                ))
            )}
        </div>
    );
}