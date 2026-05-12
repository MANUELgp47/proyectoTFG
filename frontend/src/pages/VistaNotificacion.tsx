//Muestra los datos de una notificación y la marca como leida al abrirla
import {useEffect, useState} from 'react';
import {getNotificacionPorId, marcarNotificacionComoLeida, eliminarNotificacion} from '../services/notificacionService';
import {useParams} from 'react-router-dom';
import {aceptarParticipacion, rechazarParticipacion, eliminarParticipacion} from "../services/participacionService";
import {useAuth} from "../context/AuthContext";
import {aceptarSolicitudAmistad, rechazarSolicitudAmistad} from '../services/solicitudAmistadService';
import { Bell, Calendar, Check, X, Camera, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Notificacion } from '../types';
import TopBar from "../components/ui/TopBar.tsx";


export default function VistaNotificacion() {
    const {idNotificacion} = useParams<{ idNotificacion: string }>();
    const [notificacion, setNotificacion] = useState<Notificacion | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const {idUsuario: idUsuarioSesion} = useAuth();

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
        //vuelve a la pantalla de notificaciones para que el usuario vea el cambio
        navigate('/notificaciones');
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
        //vuelve a la pantalla de notificaciones para que el usuario vea el cambio
        navigate('/notificaciones');


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
        //vuelve a la pantalla de notificaciones para que el usuario vea el cambio
        navigate('/notificaciones');
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
        //vuelve a la pantalla de notificaciones para que el usuario vea el cambio
        navigate('/notificaciones');
    }
    const handleCrearRecuerdo = () => {
        // Redirige a la página de creación de recuerdo, pasando el idReferencia (idActividad) como parámetro
        window.location.href = `/crearRecuerdo/${notificacion.idReferencia}`;
    }

    const fechaTexto = notificacion.fechaCreacion ?  new Date(notificacion.fechaCreacion).toLocaleDateString("es", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }) : "Fecha desconocida";


    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center">
            <div className="w-full mb-6 max-w-2xl">
                <TopBar/>
            </div>

            <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
                <div className="p-6 border-b border-slate-50 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
                        Detalle de Notificación
                    </h1>
                </div>

                <div className="p-8">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 ${
                        notificacion.leida ? 'bg-slate-100 text-slate-400' : 'bg-blue-500 text-white shadow-lg shadow-blue-200'
                    }`}>
                        <Bell size={32} />
                    </div>

                    <div className="space-y-6">
                        <div>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-2">
                            Mensaje
                        </span>
                            <p className="text-lg text-slate-700 font-medium leading-relaxed">
                                {notificacion.mensaje}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-6 border-t border-slate-50 pt-6">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Calendar size={16} />
                                <span className="text-xs font-bold">{fechaTexto}</span>
                            </div>

                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t-2 border-dashed border-slate-100">
                        {((notificacion.tipo === 'solicitud_union_actividad' || notificacion.tipo === 'solicitud_amistad')) &&
                            Number(notificacion.idUsuarioEmisor) !== idUsuarioSesion && (
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={notificacion.tipo === 'solicitud_union_actividad' ? handleAceptarSolicitudParticipacion : handleAceptarSolicitudAmistad}
                                        className="flex items-center justify-center gap-2 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-green-100"
                                    >
                                        <Check size={18} />
                                        Aceptar
                                    </button>
                                    <button
                                        onClick={notificacion.tipo === 'solicitud_union_actividad' ? handleRechazarSolicitudParticipacion : handlerechazarSolicitudAmistad}
                                        className="flex items-center justify-center gap-2 py-4 bg-white border-2 border-slate-200 hover:border-red-200 hover:text-red-500 text-slate-500 rounded-2xl font-bold transition-all transform hover:scale-[1.02] active:scale-95"
                                    >
                                        <X size={18} />
                                        Rechazar
                                    </button>
                                </div>
                            )}

                        {notificacion.tipo === 'posibilidad_recuerdo' &&
                            Number(notificacion.idUsuarioEmisor) !== idUsuarioSesion && (
                                <button
                                    onClick={handleCrearRecuerdo}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-2xl font-bold transition-all transform hover:scale-[1.01] active:scale-95 shadow-xl shadow-indigo-100"
                                >
                                    <Camera size={20} />
                                    Crear un recuerdo ahora
                                </button>
                            )}
                    </div>
                </div>
            </div>
        </div>
    );
}