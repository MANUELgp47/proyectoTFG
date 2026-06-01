import { useEffect, useState } from 'react';
import { getNotificaciones } from '../services/notificacionService';
import type { Notificacion } from '../types.ts';
import TopBar from "../components/ui/TopBar.tsx";

export default function Notificaciones() {
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
    const [filtro, setFiltro] = useState<string>('todas');

    // Traductor para mostrar nombres amigables en el filtro y la lista
    const nombresTipos: Record<string, string> = {
        todas: "Todas",
        solicitud_amistad: "Amistad",
        chat_individual: "Chats",
        union_actividad: "Actividades",
        actualizacion_actividad: "Cambios en Actividades",
        posibilidad_recuerdo: "Recuerdos",
        // TODO añadir mas tipos
    };

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

    // LÓGICA DE FILTRADO
    const notificacionesFiltradas = filtro === 'todas'
        ? notificaciones
        : notificaciones.filter(n => n.tipo === filtro);

    // Obtener tipos únicos presentes en mis notificaciones para llenar el selector dinámicamente
    const tiposDisponibles = ['todas', ...new Set(notificaciones.map(n => n.tipo))];

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <TopBar />
            <div className="flex items-center justify-between mb-6">

                <h1 className="text-2xl font-bold">Notificaciones</h1>

                {/* SELECTOR DE FILTRO */}
                <select
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="p-2 border rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                >
                    {tiposDisponibles.map(tipo => (
                        <option key={tipo} value={tipo}>
                            {nombresTipos[tipo] || tipo.replace(/_/g, ' ')}
                        </option>
                    ))}
                </select>
            </div>

            {notificacionesFiltradas.length === 0 ? (
                <p className="text-slate-500 italic text-center py-10">
                    No tienes notificaciones de este tipo.
                </p>
            ) : (
                <ul className="space-y-3">
                    {notificacionesFiltradas.map((notificacion) => (
                        <li
                            key={notificacion.idNotificacion}
                            className={`p-4 rounded-2xl border transition-all hover:shadow-md ${
                                notificacion.leida ? 'bg-white border-slate-200' : 'bg-blue-50 border-blue-200'
                            }`}
                        >
                            <a
                                href={`/notificaciones/${notificacion.idNotificacion}`}
                                className="block"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                        notificacion.leida ? 'bg-slate-100 text-slate-500' : 'bg-blue-500 text-white'
                                    }`}>
                                        {nombresTipos[notificacion.tipo] || notificacion.tipo.split('_')[0]}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        {new Date(notificacion.fechaCreacion).toLocaleString()}
                                    </span>
                                </div>
                                <p className={`text-sm ${notificacion.leida ? 'text-slate-600' : 'text-slate-900 font-bold'}`}>
                                    {notificacion.mensaje}
                                </p>
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};