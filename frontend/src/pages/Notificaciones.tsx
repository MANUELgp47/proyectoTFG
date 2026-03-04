//muestra las notificaciones del usuario
import  { useEffect, useState } from 'react';
import { getNotificaciones } from '../services/notificacionService';

export default function Notificaciones()  {
    const [notificaciones, setNotificaciones] = useState<any[]>([]);

    useEffect(() => {
        const fetchNotificaciones = async () => {
            try {
                const data = await getNotificaciones();
                setNotificaciones(data);
            } catch (error) {
                console.error('Error al obtener notificaciones:', error);
            }
        };

        fetchNotificaciones();
    }, []);

    return (
        <div>
            <h1>Notificaciones</h1>
            {notificaciones.length === 0 ? (
                <p>No tienes notificaciones.</p>
            ) : (
                <ul>
                    {notificaciones.map((notificacion) => (
                        <li
                            key={notificacion.idNotificacion}
                            style={{
                                color: notificacion.leida ? "black" : "red",
                                fontWeight: notificacion.leida ? "normal" : "bold"
                            }}
                        ><a href={`/notificaciones/${notificacion.idNotificacion}`}>
                            {notificacion.mensaje} - {new Date(notificacion.fecha).toLocaleString()}</a>
                        </li>
                    ))}
                </ul>
            )}
        </div>

    );
};