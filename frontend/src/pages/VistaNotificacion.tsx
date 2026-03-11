//Muestra los datos de una notificación y la marca como leida al abrirla
import {useEffect, useState} from 'react';
import {getNotificacionPorId, marcarNotificacionComoLeida, eliminarNotificacion} from '../services/notificacionService';
import {useParams} from 'react-router-dom';
import {aceptarParticipacion, rechazarParticipacion, eliminarParticipacion} from "../services/participacionService";
import { useAuth } from "../context/AuthContext";
import {aceptarSolicitudAmistad, rechazarSolicitudAmistad} from '../services/solicitudAmistadService';



interface Notificacion {
    idNotificacion?: number;
    mensaje?: string;
    fecha?: string;
    tipo?: string;
    idReferencia?: number | string;
    idUsuarioEmisor?: number | string;
    [key: string]: unknown;
}

export default function VistaNotificacion() {
    const {idNotificacion} = useParams<{ idNotificacion: string }>();
    const [notificacion, setNotificacion] = useState<Notificacion | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { idUsuario: idUsuarioSesion } = useAuth();

    useEffect(() => {
        const fetchNotificacion = async () => {
            try {
                const data = await getNotificacionPorId(Number(idNotificacion));
                setNotificacion(data);

                // Marcar la notificación como leída solo si hay sesión válida
                if (idUsuarioSesion != null) {
                    await marcarNotificacionComoLeida(Number(idNotificacion));
                }

            } catch (err) {
                console.error('Error fetching notificacion:', err);
                setError('Error al cargar la notificación');
            }
        };

        fetchNotificacion();
    }, [idNotificacion, idUsuarioSesion]);

    if (error) {
        return <div>{error}</div>;
    }

    if (!notificacion) {
        return <div>Cargando...</div>;
    }

    //TODO: si es de tipo solicitud_union_actividad el usuario tendra un boton para aceptar o rechazar la solicitud,
    const handleAceptarSolicitudParticipacion = async () => {
        const idActividad = Number(notificacion.idReferencia);
        const idUsuario = Number(notificacion.idUsuarioEmisor);
        await aceptarParticipacion(idUsuario, idActividad);
        if (notificacion.idNotificacion != null) {
            await eliminarNotificacion(Number(notificacion.idNotificacion));
        } else {
            console.warn('No hay idNotificacion para eliminar');
        }
        alert('Solicitud aceptada');
    }

    const handleRechazarSolicitudParticipacion = async () => {
        const idActividad = Number(notificacion.idReferencia);
        const idUsuario = Number(notificacion.idUsuarioEmisor);
        await rechazarParticipacion(idUsuario, idActividad);
        await eliminarParticipacion(idUsuario, idActividad); // Elimina la participación para que no quede pendiente
        if (notificacion.idNotificacion != null) {
            await eliminarNotificacion(Number(notificacion.idNotificacion));
        } else {
            console.warn('No hay idNotificacion para eliminar');
        }
        alert('Solicitud rechazada');


    }

    const handleAceptarSolicitudAmistad = async () => {
        const idReferencia = Number(notificacion.idReferencia);
        await aceptarSolicitudAmistad(idReferencia);

        if (notificacion.idNotificacion != null) {
            await eliminarNotificacion(Number(notificacion.idNotificacion));
        } else {
            console.warn('No hay idNotificacion para eliminar');
        }
        alert('Solicitud de amistad aceptada');
    }
    const handlerechazarSolicitudAmistad = async () => {
        const idReferencia = Number(notificacion.idReferencia);
        await rechazarSolicitudAmistad(idReferencia);

        if (notificacion.idNotificacion != null) {
            await eliminarNotificacion(Number(notificacion.idNotificacion));
        } else {
            console.warn('No hay idNotificacion para eliminar');
        }
        alert('Solicitud de amistad rechazada');
    }


    const fechaTexto = notificacion.fecha ? new Date(notificacion.fecha).toLocaleString() : 'Fecha no disponible';
    return (
        <div>
            <h1>Notificación</h1>
            <p><strong>Mensaje:</strong> {notificacion.mensaje}</p>
            <p><strong>Fecha:</strong> {fechaTexto}</p>
            <p>id {idUsuarioSesion}</p>

            {notificacion.tipo === 'solicitud_union_actividad' &&
                Number(notificacion.idUsuarioEmisor) !== idUsuarioSesion && (

                <>
                    <button onClick={handleAceptarSolicitudParticipacion}>Aceptar
                        solicitud
                    </button>
                    <button onClick={handleRechazarSolicitudParticipacion}>Rechazar
                        solicitud
                    </button>
                </>
            )}
            {notificacion.tipo === 'solicitud_amistad' &&
                Number(notificacion.idUsuarioEmisor) !== idUsuarioSesion && (

                    <>
                        <button onClick={handleAceptarSolicitudAmistad}>Aceptar
                            solicitud
                        </button>
                        <button onClick={handlerechazarSolicitudAmistad}>Rechazar
                            solicitud
                        </button>
                    </>
                )}

        </div>
    );
}