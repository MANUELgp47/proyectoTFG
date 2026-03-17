import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {updateActividad, finalizarActividad} from "../services/actividadService";
import api from "../api/axios";

export default function EditarActividad() {
    const {id} = useParams();
    const navigate = useNavigate();

    const [actividad, setActividad] = useState<any>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchActividad = async () => {
            try {
                const response = await api.get(`/actividad/${id}`);
                const data = response.data;
                // Convertimos las fechas a formato compatible con datetime-local
                setActividad({
                    ...data,
                    fechaInicio: data.fechaInicio?.slice(0, 16),
                    fechaFin: data.fechaFin?.slice(0, 16)
                });
            } catch (err) {
                console.error(err);
            }
        };

        fetchActividad();
    }, [id]);

    if (!actividad) return <p>no se detecta actividad...</p>;

    if (actividad.estado !== "activa") {
        return <p>Esta actividad no se puede editar al no estar activa.</p>;
    }


    const handleCancelar = async () => {
        try {
            if (!id) throw new Error('ID de actividad no disponible');
            const actividadId = Number(id);
            if (Number.isNaN(actividadId)) throw new Error('ID inválido');

            const confirmar = window.confirm(
                "¿Seguro que quieres cancelar esta actividad?"
            );
            if (!confirmar) return;

            await updateActividad(actividadId, {
                titulo: actividad.titulo,
                descripcion: actividad.descripcion,
                fechaInicio: new Date(actividad.fechaInicio).toISOString(),
                fechaFin: new Date(actividad.fechaFin).toISOString(),
                ubicacion: actividad.ubicacion,
                publica: actividad.publica,
                estado: "cancelada", // 👈 aquí cambiamos el estado
                imagenes: actividad.imagenes || []
            });

            // Actualizamos en frontend
            setActividad({...actividad, estado: "cancelada"});

        } catch (err) {
            setError("No se pudo cancelar");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {

            if (!id) throw new Error('ID de actividad no disponible');
            const actividadId = Number(id);
            if (Number.isNaN(actividadId)) throw new Error('ID de actividad inválido');


            await updateActividad(actividadId, {
                titulo: actividad.titulo,
                descripcion: actividad.descripcion,
                fechaInicio: new Date(actividad.fechaInicio).toISOString(),
                fechaFin: new Date(actividad.fechaFin).toISOString(),
                ubicacion: actividad.ubicacion,
                publica: actividad.publica,
                estado: actividad.estado,
                //  participantesmax: actividad.participantesmax,
                imagenes: actividad.imagenes || []
            });

            navigate(`/usuario/${actividad.creadorId}/actividades`);
        } catch (err) {
            setError("No se pudo actualizar");
        }
    };

    const handleFinalizar = async () => {
        try {
            if (!id) throw new Error('ID de actividad no disponible');
            const actividadId = Number(id);
            if (Number.isNaN(actividadId)) throw new Error('ID de actividad inválido');

            const confirmar = window.confirm(
                "¿Seguro que quieres finalizar esta actividad?"
            );
            if (!confirmar) return;

            await finalizarActividad(actividadId);

            // Actualizamos en frontend
            setActividad({...actividad, estado: "finalizada"});

        } catch (err) {
            setError("No se pudo finalizar");
        }
    }

    return (
        <div>
            <h1>Editar Actividad</h1>

            <form onSubmit={handleSubmit}>
                <input
                    value={actividad.titulo}
                    onChange={(e) =>
                        setActividad({...actividad, titulo: e.target.value})
                    }
                /><br/>

                <textarea
                    value={actividad.descripcion}
                    onChange={(e) =>
                        setActividad({...actividad, descripcion: e.target.value})
                    }
                /><br/>
                <input
                    type="datetime-local"
                    value={actividad.fechaInicio}
                    onChange={(e) =>
                        setActividad({...actividad, fechaInicio: e.target.value})
                    }
                /><br/>
                <input
                    type="datetime-local"
                    value={actividad.fechaFin}
                    onChange={(e) =>
                        setActividad({...actividad, fechaFin: e.target.value})
                    }
                /><br/>
                <input
                    type="text"
                    placeholder="Ubicación"
                    value={actividad.ubicacion}
                    onChange={(e) =>
                        setActividad({...actividad, ubicacion: e.target.value})
                    }
                /><br/>
                <textarea
                    value={actividad.imagenes}
                    onChange={(e) =>
                        setActividad({...actividad, imagenes: e.target.value})
                    }
                /><br/>


                <button type="submit">Actualizar</button>
                {actividad.estado === "activa" && (
                    <div>
                        <button
                            type="button"
                            onClick={handleCancelar}
                            style={{backgroundColor: "red", color: "white", marginLeft: "10px"}}
                        >
                            Cancelar actividad
                        </button>
                        <button
                            type="button"
                            onClick={handleFinalizar}
                            style={{backgroundColor: "orange", color: "white", marginLeft: "10px"}}
                        >
                            Finalizar actividad
                        </button>
                    </div>
                )}

            </form>


            {error && <p>{error}</p>}
        </div>
    );
}