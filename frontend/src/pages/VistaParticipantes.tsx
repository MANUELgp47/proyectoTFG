//Muestra los participantes de un evento, con su nombre, enlace a su perfil, Y en caso de ser Actividad.admins, un botón para expulsar al participante de la actividad y otro de convertir en admin al participante
//Si el usuario es admin, también mostrar un botón para quitar a un admin de la actividad
//tambien se mostrará al final una lista de expulsados solo visible para admins
import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {getActividadPorId, addAdmin, removeAdmin, addExpulsado, removeExpulsado} from '../services/actividadService';
import type {Usuario, Actividad} from '../types';
import {getParticipacionesPorActividad} from "../services/participacionService";
import {useAuth} from '../context/AuthContext';

export function VistaParticipantes() {
 //   const {idActividad} = useParams<{ idActividad: string }>();
    const {idActividad} = useParams();
//    const idActividad = id;
    const [participantes, setParticipantes] = useState<Usuario[]>([]);
    const [actividad, setActividad] = useState<Actividad | null>(null);
    const [loading, setLoading] = useState(true);
    const [expulsados, setExpulsados] = useState<number[]>([]);

    const auth = useAuth();
    const idSesion = auth.idUsuario;
    const rolSesion = auth.rol; // rol global (admin/mod) si aplica

    useEffect(() => {
        const fetchData = async () => {
            try {

                console.log('Cargando participantes para actividad id:', idActividad);

                if (idActividad != undefined && idActividad != null) {

                    console.log('Cargando id:', idActividad);
                    const participantesData = await getParticipacionesPorActividad(Number(idActividad));
                    const usuarios: Usuario[] = participantesData.map((p: any) => p.usuario ? p.usuario : p);
                    setParticipantes(usuarios);

                    const actividadData = await getActividadPorId(Number(idActividad));
                    setActividad(actividadData);

                    // extraer expulsados si existen en la actividad
                    if (actividadData && actividadData.expulsados) {
                        setExpulsados(actividadData.expulsados);
                    } else {
                        setExpulsados([]);
                    }
                    console.log('Participantes cargados:', usuarios);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [idActividad]);

    if (loading) {
        return <div>Cargando participantes...</div>;
    }

    // helpers permisos: es creador o admin dentro de la actividad
    const esCreadorActividad = actividad && idSesion === actividad.idCreador;
    const esAdminActividad = actividad && actividad.admins ? actividad.admins.includes(idSesion as number) : false;

    const puedeGestionar = Boolean(esCreadorActividad || esAdminActividad || rolSesion === 'admin' || rolSesion === 'mod');

    const handleExpulsar = async (idUsuarioExpulsar: number) => {
        if (!idActividad) return;
        if (!idSesion) return;
        if (!window.confirm('¿Estás seguro de expulsar a este usuario de la actividad?')) return;

        try {
            const resp= addExpulsado(Number(idActividad), idUsuarioExpulsar);


            if (!resp) {
                throw new Error('Error al expulsar al usuario');
            }

            // tras expulsar,refrescamos la lista de participantes y la lista de expulsados localmente sin necesidad de recargar toda la actividad
            setParticipantes(prev => prev.filter(p => p.idUsuario !== idUsuarioExpulsar));
            setExpulsados(prev => [...prev, idUsuarioExpulsar]);

        } catch (error: any) {
            console.error('Error expulsando usuario:', error);
            alert(error.message || 'Error al expulsar al usuario');
        }
    };

    const handleReadmitir = async (idUsuarioReincluir: number) => {
        if (!idActividad) return;
        if (!idSesion) return;
        if (!window.confirm('¿Reincorporar a este usuario a la actividad?')) return;

        try {
            const resp = await removeExpulsado(Number(idActividad), idUsuarioReincluir);

            if (!resp) {
                throw new Error('Error al reincorporar al usuario');
            }

          //refrescamos toda la lista de participantes y expulsados desde el backend para evitar inconsistencias
            const participantesData = await getParticipacionesPorActividad(Number(idActividad));
            const usuarios: Usuario[] = participantesData.map((p: any) => p.usuario ? p.usuario : p);
            setParticipantes(usuarios);

            const actividadData = await getActividadPorId(Number(idActividad));
            setActividad(actividadData);

             // extraer expulsados si existen en la actividad
             if (actividadData && actividadData.expulsados) {
                setExpulsados(actividadData.expulsados);
            } else {
                setExpulsados([]);
            }

        } catch (error: any) {
            console.error('Error reincorporando usuario:', error);
            alert(error.message || 'Error al reincorporar al usuario');
        }
    };

    const handleAddAdmin = async (idUsuarioTarget: number, makeAdmin: boolean) => {
        if (!idActividad) return;
        if (!idSesion) return;
        if (!window.confirm(makeAdmin ? '¿Dar permisos de admin a este participante?' : '¿Quitar permisos de admin a este participante?')) return;

        try {
            //makeAdmin es true si queremos hacer admin, false si queremos quitar admin. Llamamos a la función correspondiente del servicio según el caso

           if (makeAdmin)
                await addAdmin(Number(idActividad), idUsuarioTarget);
            else
                await removeAdmin(Number(idActividad), idUsuarioTarget);

            // actualizar actividad localmente: si se añade admin, añadir al array admins; si se quita, eliminar
            setActividad(prev => {
                if (!prev) return prev;
                const admins = prev.admins ? Array.from(new Set(prev.admins)) : [];
                if (makeAdmin) {
                    if (!admins.includes(idUsuarioTarget)) admins.push(idUsuarioTarget);
                } else {
                    const idx = admins.indexOf(idUsuarioTarget);
                    if (idx !== -1) admins.splice(idx, 1);
                }
                return {...prev, admins};
            });
        } catch (error: any) {
            console.error('Error editando admin:', error);
            alert(error.message || 'Error al editar admin');
        }
    };

    return (
        <div>
            <h2>Participantes de {actividad?.titulo}</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {participantes.map((participante) => (
                    <li key={participante.idUsuario} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 0',          // Espacio arriba y abajo de la línea
                        borderBottom: '1px solid #ccc' // La línea divisoria
                    }}>
                        <a href={`/usuario/${participante.idUsuario}`}>{participante.idUsuario}</a>

                        {/* Botones de gestión (solo si la sesión puede gestionar) */}
                        {puedeGestionar && pesertaEsGestionable(participante.idUsuario, idSesion as number, actividad) && (
                            <>
                                {/* Expulsar */}
                                <button onClick={() => handleExpulsar(participante.idUsuario)}
                                        style={{backgroundColor: 'red', color: 'white'}}>Expulsar
                                </button>

                                {/* Promover a admin / quitar admin (si la actividad tiene admins) */}
                                {actividad && actividad.admins && actividad.admins.includes(participante.idUsuario) ? (
                                    <button onClick={() => handleAddAdmin(participante.idUsuario, false)}>Quitar
                                        admin</button>
                                ) : (
                                    <button onClick={() => handleAddAdmin(participante.idUsuario, true)}>Hacer
                                        admin</button>
                                )}
                            </>
                        )}
                    </li>
                ))}
            </ul>

            {/* Sección expulsados, solo visible para quien pueda gestionar */}
            {puedeGestionar && (
                <div style={{marginTop: '20px'}}>
                    <h3>Expulsados</h3>
                    {expulsados.length === 0 ? (
                        <p>No hay expulsados.</p>
                    ) : (
                        <ul>
                            {expulsados.map(id => (
                                <li key={id} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    <a href={`/perfil/${id}`}>Usuario {id}</a>
                                    <button onClick={() => handleReadmitir(id)}>Reincorporar</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

// Helper local para evitar mostrar acciones sobre el creador o sobre la propia sesión (no puedes expulsarte ni cambiar rol del creador)
function pesertaEsGestionable(idTarget: number, idSesion: number, actividad: Actividad | null) {
    if (!actividad) return false;
    // no gestionar al creador
    if (actividad.idCreador === idTarget) return false;
    // no gestionar a ti mismo
    if (idTarget === idSesion) return false;
    return true;
}
