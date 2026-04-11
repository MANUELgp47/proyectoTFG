import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {getActividadPorId, eliminarActividad} from "../services/actividadService";
import {
    eliminarParticipacion,
    getNumeroParticipantes,
    getParticipacionPorId,
    participarEnActividad
} from "../services/participacionService";
import {getChatActividad} from "../services/chatService";
import {useAuth} from "../context/AuthContext.tsx";
import type {Actividad} from "../types.ts";


// Tipos locales mínimos para evitar `any`


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
    const [idChatActividad, setIdChatActividad] = useState<number | null>(null);
    const {idUsuario, rol} = useAuth();
    const idSesion = Number(idUsuario);
    //Es admin de la actividad?
    const [isAdminActividad, setIsAdminActividad] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("Cargando detalles de la actividad con id:", id);
                if (id) {
                    const data = await getActividadPorId(Number(id));
                    setActividad(data);

                    const num = await getNumeroParticipantes(Number(id));
                    setNumeroParticipantes(num);

                    const miParticipacion = await getParticipacionPorId(Number(id));
                    setParticipacion(miParticipacion);

                    //si participo en la actividad, cargar el chat de la actividad para marcar los mensajes como leídos
                    if (miParticipacion && miParticipacion.aceptada) {
                        //   console.log("Cargando chat de la actividad para marcar mensajes como leídos, miParticipacion", miParticipacion);
                        const chat = await getChatActividad(Number(id));

                        // Comprobamos que chat no sea false ni un booleano antes de acceder a sus propiedades
                        if (chat && typeof chat !== 'boolean' && 'idChatActividad' in chat) {
                            setIdChatActividad(chat.idChatActividad);
                        } else {
                            // Si no hay chat, dejamos idChatActividad en null y avisamos en consola (no lanzar excepción)
                            console.warn('No se encontró chat de actividad para id:', id);
                            setIdChatActividad(null);
                        }


                        // console.log(chat.idChatActividad);
                    }

                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    //Comprobar si el usuario es el creador de la actividad o admin para mostrar opciones de edición/borrado
    useEffect(() => {

      if (actividad?.idCreador === idSesion) {
            setIsAdminActividad(true);
      }

      //busca el idSesion en la lista Actividad.admins para ver si es admin de la actividad
      if (actividad?.admins && actividad.admins.includes(idSesion)) {
            setIsAdminActividad(true);
      }

    }, [actividad, idSesion, rol]);

    if (loading) return <p>Cargando...</p>;
    if (!actividad) return <p>Actividad no encontrada.</p>;

    const participantesPublica = actividad.publica ? "Esta actividad es pública." : `Participantes: ${numeroParticipantes} / ${actividad.participantesmax}`;
    const handleParticipar = async () => {
        try {
            // llama a tu endpoint participar
            await participarEnActividad(actividad.idActividad);
            console.log("Participar");
            // Recargar la página para actualizar el estado de participación
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDejarParticipar = async () => {
        try {
            // llama a tu endpoint dejar participar

            if (idSesion == null) {
                console.error("No se pudo obtener el ID de sesión del usuario.");
                return;
            }
            if (actividad.idActividad == null) {
                console.error("No se pudo obtener el ID de la actividad.");
                return;
            }
            if (actividad.idCreador == idSesion) {
                console.error("El creador de la actividad no puede dejar de participar.");
                return;
            }

            eliminarParticipacion(idSesion, actividad.idActividad);

            window.location.reload();
            console.log("Dejar participar");
        } catch (error) {
            console.error(error);
        }
    };

    const handleEliminarActividad = () => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta actividad? Esta acción no se puede deshacer.")) {
            eliminarActividad(actividad.idActividad);
            // Redirigir a la página principal o a otra página después de eliminar
            window.location.href = "/";
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
                isAdminActividad && actividad.estado == 'activa' ? (/*Creador*/
                    <button
                        onClick={() => window.location.href = `/ActualizarActividad/${actividad.idActividad}`}
                    >
                        Editar actividad
                    </button>
                ) : miParticipacion.aceptada && actividad.estado == 'activa' ? ( /* Participo aprobado */
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
                (Number(actividad.participantesmax) > numeroParticipantes) || Number(actividad.participantesmax) === 0 ? (/* No participo */
                    <button onClick={handleParticipar}>
                        Participar
                    </button>
                ) : (
                    <p>No hay plazas disponibles.</p>
                )
            )
            }

            {/*Si participo muestra un boton para el chat de la actividad*/}
            {miParticipacion && miParticipacion.aceptada && (
                <button
                    onClick={() => window.location.href = `/ChatActividad/${idChatActividad}`}
                >
                    Ir al chat de la actividad
                </button>
            )}
            {/*  Control de borrado Por moderadores */}
            {(rol === 'admin' || rol === 'mod') && (
                <div style={{marginTop: "20px", borderTop: "1px solid #ccc", paddingTop: "10px"}}>
                    <button
                        onClick={handleEliminarActividad}
                        style={{backgroundColor: "darkred", color: "white"}}
                    >
                        Eliminar actividad (Admin/Mod)
                    </button>
                </div>
            )}
            {(rol === 'admin' ) && (
                <div style={{marginTop: "20px", borderTop: "1px solid #ccc", paddingTop: "10px"}}>
                    <button
                        onClick={() => window.location.href = `/ActualizarActividad/${actividad.idActividad}`}
                        style={{backgroundColor: "white", color: "blue"}}
                    >
                        Editar actividad
                    </button>
                </div>
            )}
        </div>
    );
}