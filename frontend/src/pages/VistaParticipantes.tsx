
import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {getActividadPorId, addAdmin, removeAdmin, addExpulsado, removeExpulsado} from '../services/actividadService';
import type {Usuario, Actividad} from '../types';
import {
    getParticipacionesAceptadasPorActividad,
    getParticipacionesPorActividad
} from "../services/participacionService";
import {useAuth} from '../context/AuthContext';
import {getPrivacidad} from "@/services/settingsService.ts";
import {getDatosMinimosUsuario} from "../services/usuarioService.ts";
import type {UsuarioMinimo} from "../types.ts";
import {Link, useNavigate} from "react-router-dom";
import {
    ArrowLeft,
    Users,
    Lock,
    UserX,
    Shield,
    ShieldOff,
    RotateCcw,
    Ban,
    Crown,
} from "lucide-react";
import TopBar from "../components/ui/TopBar.tsx";


/*
* TODO: Plan
*  crear un mapa de IDusuarios, otro UsuariosMinimosDatos, UsuarioPrivacidad
* si la actividad es publica, no mostrar usuarios privados
* si hay usuarios privados y es publica mostrar otra lista de participantes privados solo a los admins/creador
* */


export function VistaParticipantes() {
    //   const {idActividad} = useParams<{ idActividad: string }>();
    const {idActividad} = useParams();
    const navigate = useNavigate();
//    const idActividad = id;
    const [participantes, setParticipantes] = useState<Usuario[]>([]);
    const [actividad, setActividad] = useState<Actividad | null>(null);
    const [loading, setLoading] = useState(true);
    const [expulsados, setExpulsados] = useState<number[]>([]);

    const auth = useAuth();
    const idSesion = auth.idUsuario;
    const rolSesion = auth.rol; // rol global (admin/mod) si aplica
    //mapa privacidad de cada usuario
    //const [privacidadUsuarios, setPrivacidadUsuarios] = useState<{[id: number]: boolean}>({}); // idUsuario -> privacidad:boolean
    const [participantesPrivados, setParticipantesPrivados] = useState<Usuario[]>([]); // lista de participantes privados (si la actividad es pública)
    //const [datosMinimosUsuarios, setDatosMinimosUsuarios] = useState<{[id: number]: {nombre: string}}>({}); // idUsuario -> datos mínimos (nombre)

    const [mapUsuarioDatosMinimos, setMapUsuarioDatosMinimos] = useState<{ [id: number]: UsuarioMinimo }>({}); // idUsuario -> datos mínimos (nombre)


    //primero carga la actividad
    useEffect(() => {
        const cargarActividad = async () => {
            try {
                if (idActividad != undefined && idActividad != null) {
                    const actividadData = await getActividadPorId(Number(idActividad));
                    setActividad(actividadData);
                }
            } catch (error) {
                console.error('Error cargando actividad:', error);
            }
        };
        cargarActividad();
    }, [idActividad]);


    useEffect(() => {
        const fetchData = async () => {
            try {


                if (idActividad != undefined && idActividad != null) {


                    const participantesData = await getParticipacionesAceptadasPorActividad(Number(idActividad));

                    //crea un mapa de los usuarios participantes con su idUsuario como clave y el objeto Usuario como valor| no constante para poder modificarlo luego
                    //     const usuarios: Usuario[] = participantesData.map((p: any) => p.usuario ? p.usuario : p);


                    //recorre el array y obtiene los participantes privados privacidad.actividadPublica
                    /*  if (actividad?.publica===false){
                          const privados: Usuario[] = [];
                          for (const p of usuarios) {
                              const privacidad = await getPrivacidad(p.idUsuario);
                              if (!privacidad.actividadPublica) {
                                  privados.push(p);
                                  //saca al usuario del array usuarios
                                  setParticipantes(prev => prev.filter(u => u.idUsuario !== p.idUsuario));// lo saca de la lista de participantes públicos y lo mete en la lista de participantes privados

                              }
                          }
                          setParticipantesPrivados(privados);
                      }
                      setParticipantes(usuarios);

  */
                    //recorre participantesData y si su privacidad es actividadPublica false, lo mete en participantesPrivados, si no en participantes
                    if (actividad && actividad.publica === true) {

                        const privados: Usuario[] = [];
                        const publicos: Usuario[] = [];
                        for (const p of participantesData) {
                            const usuario: Usuario = p.usuario ? p.usuario : p;
                            const privacidad = await getPrivacidad(usuario.idUsuario);
                            if (!privacidad.actividadPublica) {
                                privados.push(usuario);
                            } else {
                                publicos.push(usuario);
                            }
                        }

                        setParticipantes(publicos);
                        setParticipantesPrivados(privados);

                    } else if (actividad) {

                        const usuarios: Usuario[] = participantesData.map((p: any) => p.usuario ? p.usuario : p);
                        setParticipantes(usuarios);
                    }


                    // extraer expulsados si existen en la actividad
                    if (actividad && actividad.expulsados) {
                        setExpulsados(actividad.expulsados);
                    } else {
                        setExpulsados([]);
                    }

                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [idActividad, actividad]);


    //crea el mapa de los participantes con su idUsuario como clave y valor usuarioMinimo
    useEffect(() => {
        const cargarDatosMinimos = async () => {
            if (participantes.length === 0) return;
            const map: { [id: number]: UsuarioMinimo } = {};
            for (const p of participantes) {
                try {
                    const datosMinimos = await getDatosMinimosUsuario(p.idUsuario);
                    map[p.idUsuario] = datosMinimos;
                } catch (error) {
                    console.error('Error cargando datos mínimos para usuario id:', p.idUsuario, error);
                }
            }
            //hace lo mismo para los participantes privados si existen
            for (const p of participantesPrivados) {
                try {
                    const datosMinimos = await getDatosMinimosUsuario(p.idUsuario);
                    map[p.idUsuario] = datosMinimos;
                } catch (error) {
                    console.error('Error cargando datos mínimos para usuario privado id:', p.idUsuario, error);
                }
            }
            //tambien lo mismo para los expulsados
            for (const id of expulsados) {
                try {
                    const datosMinimos = await getDatosMinimosUsuario(id);
                    map[id] = datosMinimos;
                } catch (error) {
                    console.error('Error cargando datos mínimos para usuario expulsado id:', id, error);
                }
            }

            setMapUsuarioDatosMinimos(map);
        };
        cargarDatosMinimos();
    }, [participantes, participantesPrivados, expulsados]);

    if (loading) {
        return <div>Cargando participantes...</div>;
    }

    // helpers permisos: es creador o admin dentro de la actividad
    const esCreadorActividad = actividad && idSesion === actividad.idCreador;
    const esAdminActividad = actividad && actividad.admins ? actividad.admins.includes(idSesion as number) : false;

    const puedeGestionar = Boolean(esCreadorActividad || esAdminActividad  );
    const puedeVerPrivados = Boolean(esCreadorActividad || esAdminActividad || rolSesion === 'admin' || rolSesion === 'mod');

    const handleExpulsar = async (idUsuarioExpulsar: number) => {
        if (!idActividad) return;
        if (!idSesion) return;
        if (!window.confirm('¿Estás seguro de expulsar a este usuario de la actividad?')) return;

        try {
            const resp = addExpulsado(Number(idActividad), idUsuarioExpulsar);


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

    function SectionCard({
                             icon,
                             title,
                             subtitle,
                             count,
                             empty,
                             children,
                         }: {
        icon: React.ReactNode;
        title: string;
        subtitle?: string;
        count: number;
        empty: string;
        children: React.ReactNode;
    }) {



        return (
            <section className="bg-white rounded-3xl p-6 shadow-sm">
                <header className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
                            {icon}
                        </div>
                        <div>
                            <h2
                                className="text-lg font-extrabold text-secondary leading-tight"
                                style={{fontFamily: "'Manrope', sans-serif"}}
                            >
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="text-[11px] text-neutral mt-0.5">{subtitle}</p>
                            )}
                        </div>
                    </div>
                    <span className="text-xs font-bold text-neutral bg-neutral-light px-3 py-1 rounded-full shrink-0">
          {count}
        </span>
                </header>

                {count === 0 ? (
                    <div className="py-6 text-center text-sm text-neutral">{empty}</div>
                ) : (
                    <div>{children}</div>
                )}
            </section>
        );
    }

    /* ---------- Fila de participante ---------- */
    interface ParticipantRowProps {
        idUsuario: number;
        datos?: UsuarioMinimo;
        esAdmin: boolean;
        gestionable: boolean;
        onExpulsar: () => void;
        onToggleAdmin: (makeAdmin: boolean) => void;
    }

    function ParticipantRow({
                                idUsuario,
                                datos,
                                esAdmin,
                                gestionable,
                                onExpulsar,
                                onToggleAdmin,
                            }: ParticipantRowProps) {
        return (
            <div className="flex items-center gap-3 py-3 first:pt-0 border-t border-slate-100 first:border-t-0">
                {/* Usuario */}
                <Link
                    to={`/usuario/${idUsuario}`}
                    className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition"
                >
                    <div className="relative shrink-0">
                        <div
                            className="w-10 h-10 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-white text-sm font-bold">
                            {datos?.imagen ? (
                                <img
                                    src={
                                        typeof datos?.imagen === "string"
                                            ? datos.imagen
                                            : Array.isArray(datos?.imagen)
                                                ? datos.imagen[0]
                                                : undefined
                                    }
                                    alt={datos.nombreUsuario}
                                    className="w-full h-full object-cover"
                                    onError={(e) =>
                                        ((e.currentTarget as HTMLImageElement).style.display = "none")
                                    }
                                />
                            ) : (
                                (datos?.nombreUsuario || "?").charAt(0).toUpperCase()
                            )}
                        </div>
                        {esAdmin && (
                            <div
                                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-tertiary flex items-center justify-center ring-2 ring-white"
                                title="Administrador"
                            >
                                <Crown className="w-3 h-3 text-secondary"/>
                            </div>
                        )}
                    </div>

                    <div className="min-w-0">
                        <div className="text-sm font-bold text-secondary truncate">
                            {datos?.nombreUsuario ?? `Usuario #${idUsuario}`}
                        </div>
                        {esAdmin && (
                            <div className="text-[10px] font-bold tracking-wider text-primary uppercase">
                                Administrador
                            </div>
                        )}
                    </div>
                </Link>

                {/* Acciones (solo si puede gestionar) */}
                {gestionable && (
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => onToggleAdmin(!esAdmin)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                                esAdmin
                                    ? "bg-neutral-light text-secondary hover:bg-slate-200"
                                    : "bg-primary-50 text-primary hover:bg-primary-100"
                            }`}
                            title={esAdmin ? "Quitar admin" : "Hacer admin"}
                        >
                            {esAdmin ? (
                                <>
                                    <ShieldOff className="w-3.5 h-3.5"/>
                                    <span className="hidden sm:inline">Quitar admin</span>
                                </>
                            ) : (
                                <>
                                    <Shield className="w-3.5 h-3.5"/>
                                    <span className="hidden sm:inline">Hacer admin</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={onExpulsar}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition"
                            title="Expulsar"
                        >
                            <UserX className="w-3.5 h-3.5"/>
                            <span className="hidden sm:inline">Expulsar</span>
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FB]">
            <div className="max-w-[900px] mx-auto px-6 py-6">
                <TopBar/>

                {/* Volver + Cabecera */}
                <div className="mt-4 flex items-center gap-4 mb-8">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-white text-secondary flex items-center justify-center hover:bg-neutral-light transition shadow-sm shrink-0"
                        aria-label="Volver"
                    >
                        <ArrowLeft className="w-5 h-5"/>
                    </button>
                    <div>
                        <h1
                            className="text-3xl sm:text-4xl font-extrabold text-secondary tracking-tight leading-tight"
                            style={{fontFamily: "'Manrope', sans-serif"}}
                        >
                            Participantes
                        </h1>
                        {actividad?.titulo && (
                            <Link
                                to={`/actividad/${actividad.idActividad}`}
                                className="text-sm text-primary font-semibold hover:underline"
                            >
                                {actividad.titulo}
                            </Link>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* ============ PARTICIPANTES (público) ============ */}
                    <SectionCard
                        icon={<Users className="w-5 h-5 text-primary"/>}
                        title="Participantes"
                        count={participantes.length}
                        empty="Aún no hay participantes."
                    >
                        {participantes.map((p) => (
                            <ParticipantRow
                                key={p.idUsuario}
                                idUsuario={p.idUsuario}
                                datos={mapUsuarioDatosMinimos[p.idUsuario]}
                                esAdmin={!!actividad?.admins?.includes(p.idUsuario)}
                                gestionable={
                                    puedeGestionar &&
                                    pesertaEsGestionable(p.idUsuario, idSesion as number, actividad)
                                }
                                onExpulsar={() => handleExpulsar(p.idUsuario)}
                                onToggleAdmin={(makeAdmin) =>
                                    handleAddAdmin(p.idUsuario, makeAdmin)
                                }
                            />
                        ))}
                    </SectionCard>

                    {/* ============ PARTICIPANTES PRIVADOS (solo admin) ============ */}
                    {puedeVerPrivados && actividad?.publica === true && (
                        <SectionCard
                            icon={<Lock className="w-5 h-5 text-primary"/>}
                            title="Participantes privados"
                            subtitle="Solo visible para administradores y creador"
                            count={participantesPrivados.length}
                            empty="No hay participantes privados."
                        >
                            {participantesPrivados.map((p) => (
                                <ParticipantRow
                                    key={p.idUsuario}
                                    idUsuario={p.idUsuario}
                                    datos={mapUsuarioDatosMinimos[p.idUsuario]}
                                    esAdmin={!!actividad?.admins?.includes(p.idUsuario)}
                                    gestionable={
                                        puedeGestionar &&
                                        pesertaEsGestionable(
                                            p.idUsuario,
                                            idSesion as number,
                                            actividad,
                                        )
                                    }
                                    onExpulsar={() => handleExpulsar(p.idUsuario)}
                                    onToggleAdmin={(makeAdmin) =>
                                        handleAddAdmin(p.idUsuario, makeAdmin)
                                    }
                                />
                            ))}
                        </SectionCard>
                    )}

                    {/* ============ EXPULSADOS (solo admin) ============ */}
                    {puedeVerPrivados && (
                        <SectionCard
                            icon={<Ban className="w-5 h-5 text-red-500"/>}
                            title="Expulsados"
                            subtitle="Solo visible para administradores y creador"
                            count={expulsados.length}
                            empty="No hay usuarios expulsados."
                        >
                            {expulsados.map((id) => {
                                const datos = mapUsuarioDatosMinimos[id];
                                const gestionable = puedeGestionar && pesertaEsGestionable(id, idSesion as number, actividad);

                                return (
                                    <div
                                        key={id}
                                        className="flex items-center gap-3 py-3 first:pt-0 border-t border-slate-100 first:border-t-0"
                                    >
                                        <Link
                                            to={`/usuario/${id}`}
                                            className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-neutral overflow-hidden flex items-center justify-center text-white font-bold shrink-0">
                                                {datos?.imagen ? (
                                                    <img
                                                        src={
                                                            typeof datos?.imagen === "string"
                                                                ? datos.imagen
                                                                : Array.isArray(datos?.imagen)
                                                                    ? datos.imagen[0]
                                                                    : undefined
                                                        }
                                                        alt={datos.nombreUsuario}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                                                    />
                                                ) : (
                                                    (datos?.nombreUsuario ?? `Usuario #${id}`).charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <span className="text-sm font-semibold text-secondary truncate">
          {datos?.nombreUsuario ?? `Usuario #${id}`}
        </span>
                                        </Link>

                                        {gestionable && (
                                            <button
                                                type="button"
                                                onClick={() => handleReadmitir(id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tertiary/15 text-secondary text-xs font-bold hover:bg-tertiary/30 transition"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5" />
                                                Reincorporar
                                            </button>
                                        )}
                                    </div>
                                );
                            })}

                        </SectionCard>
                    )}
                </div>
            </div>
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
