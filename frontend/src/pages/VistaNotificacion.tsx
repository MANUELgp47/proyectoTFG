//Muestra los datos de una notificación y la marca como leida al abrirla
import {useEffect, useState} from 'react';
import {getNotificacionPorId, marcarNotificacionComoLeida} from '../services/notificacionService';
import {useParams} from 'react-router-dom';
import {aceptarParticipacion} from "../services/participacionService.ts";

export default function VistaNotificacion() {
    const {idNotificacion} = useParams<{ idNotificacion: string }>();
    const [notificacion, setNotificacion] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotificacion = async () => {
            try {
                const data = await getNotificacionPorId(Number(idNotificacion));
                setNotificacion(data);

                // Marcar la notificación como leída
                await marcarNotificacionComoLeida(Number(idNotificacion));

            } catch (err) {
                setError('Error al cargar la notificación');
            }
        };

        fetchNotificacion();
    }, [idNotificacion]);

    if (error) {
        return <div>{error}</div>;
    }

    if (!notificacion) {
        return <div>Cargando...</div>;
    }

    //TODO: si es de tipo solicitud_union_actividad el usuario tendra un boton para aceptar o rechazar la solicitud,
    const handleAceptarSolicitudParticipacion = () => {
        const idActividad = notificacion.idReferencia;
        await aceptarParticipacion(idUsuario, idActividad);
        alert('Solicitud aceptada');
    }

    return (
        <div>
            <h1>Notificación</h1>
            <p><strong>Mensaje:</strong> {notificacion.mensaje}</p>
            <p><strong>Fecha:</strong> {new Date(notificacion.fecha).toLocaleString()}</p>

            {notificacion.tipo === 'solicitud_union_actividad' && (

                <>
                    <button onClick={handleAceptarSolicitudParticipacion}>Aceptar
                        solicitud
                    </button>
                    <button onClick={() => alert('Funcionalidad de rechazar solicitud aún no implementada')}>Rechazar
                        solicitud
                    </button>
                </>
            )}

        </div>
    );
}