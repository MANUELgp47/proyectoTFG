import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {getActividadPorId} from "../services/actividadService";
import {getNumeroParticipantes, getParticipacionPorId, participarEnActividad} from "../services/participacionService";


// Tipos locales mínimos para evitar `any`
interface Actividad {
    idActividad: number;
    titulo: string;
    descripcion?: string;
    fechaInicio: string | Date;
    fechaFin: string | Date;
    ubicacion?: string;
    imagenes?: string[];
    publica?: boolean;
    participantesmax?: number;
}

interface Participacion {
    esCreador?: boolean;
    aceptada?: boolean;
}

export function ActividadDetalle() {
    const {id} = useParams();
    const [actividad, setActividad] = useState<Actividad | null>(null);
    const [loading, setLoading] = useState(true);
    const [numeroParticipantes, setNumeroParticipantes] = useState(0);
    const [miParticipacion, setParticipacion] = useState<Participacion | null>(null);


    useEffect(() => {
        const fetchData = async () => {
            try {
                if (id) {
                    const data = await getActividadPorId(Number(id));
                    setActividad(data);

                    const num = await getNumeroParticipantes(Number(id));
                    setNumeroParticipantes(num);

                    const miParticipacion = await getParticipacionPorId(Number(id));
                    setParticipacion(miParticipacion);



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
    if (!actividad) return <p>Actividad no encontrada.</p>;

    const participantesPublica = actividad.publica ? "Esta actividad es pública." : `Participantes: ${numeroParticipantes} / ${actividad.participantesmax}`;
    const handleParticipar = async () => {
        try {
            // llama a tu endpoint participar
            await participarEnActividad(actividad.idActividad);
            console.log("Participar");
        } catch (error) {
            console.error(error);
        }
    };

    const handleDejarParticipar = async () => {
        try {
            // llama a tu endpoint dejar participar
            console.log("Dejar participar");
        } catch (error) {
            console.error(error);
        }
    };




    return (
        <div>
            <h1>{actividad.titulo}</h1>
            <p>{actividad.descripcion}</p>
            <p>Fecha de inicio: {new Date(actividad.fechaInicio).toLocaleString()}</p>
            <p>Fecha de fin: {new Date(actividad.fechaFin).toLocaleString()}</p>
            <p>Ubicación: {actividad.ubicacion}</p>
            <p>{participantesPublica}</p>

            {actividad.imagenes && actividad.imagenes.length > 0 && (
                <div>
                    <h3>Imágenes:</h3>
                    {actividad.imagenes.map((url: string, index: number) => (
                        <img key={index} src={url} alt={`Imagen ${index + 1}`}
                             style={{maxWidth: "200px", marginRight: "10px"}}/>
                    ))}
                </div>
            )}


            {/* Estado de participación: mostrar mensajes específicos según miParticipacion */}
            {miParticipacion ? (
                miParticipacion.esCreador ? (/*Creador*/
                    <button
                        onClick={() => window.location.href = `/ActualizarActividad/${actividad.idActividad}`}
                    >
                        Editar actividad
                    </button>
                ) : miParticipacion.aceptada ? ( /* Participo aprobado */
                    <button
                        onClick={handleDejarParticipar}
                        style={{backgroundColor: "red", color: "white"}}
                    >
                        Dejar de participar
                    </button>
                ) : (/* Participación pendiente */
                    <p>Tu participación está pendiente de aprobación.</p>
                )
            ) : (
                Number(actividad.participantesmax) > numeroParticipantes ? (/* No participo */
                    <button onClick={handleParticipar}>
                        Participar
                    </button>
                ) : (
                    <p>No hay plazas disponibles.</p>
                )
            )}




        </div>

    );
}