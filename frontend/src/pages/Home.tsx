import {useEffect, useState} from "react";
import {getActividadesFiltro} from "../services/actividadService";
import {useAuth} from "../context/AuthContext";
import {Link} from "react-router-dom";
import {getActividades, getDatosMinimosActividadPorId} from "../services/actividadService.ts";
import {getDatosMinimosUsuario} from "../services/usuarioService.ts";
import {getTags} from "../services/tagService.ts";
//import type {Actividad} from "../types.ts";
import '../index.css';

import {getNumeroParticipantes} from "../services/participacionService.ts";

import {getMensajePorId} from "../services/mensajeService.ts";
//estilo
//import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
//importar index.css para estilos globales


import {
    Search,
    Bell,
    SlidersHorizontal,
    User,
    LogOut,
    LogIn,
    Calendar,
    Users,
    MapPin
} from "lucide-react";

import {Popover, PopoverContent, PopoverTrigger} from "../components/ui/popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../components/ui/dropdown-menu";
import {Checkbox} from "../components/ui/checkbox";
import {getMisChatsActividad, getMisChatsIndividual, } from "../services/chatService.ts";


export default function Home() {
    const [actividades, setActividades] = useState<any[]>([]);
    const {isAuthenticated, idUsuario, rol} = useAuth();
    const [tagsDisponibles, setTagsDisponibles] = useState<string[]>([]);
    const [chatsActividad, setChatsActividad] = useState<any[]>([]);
    const [chatsIndividuales, setChatsIndividuales] = useState<any[]>([]);
    const [ultimosMensajes, setUltimosMensajes] = useState<{ [key: number]: string }>({});
    const [participaciones, setParticipaciones] = useState<Record<number, number>>({}); // Mapa de idActividad a número de participantes
    //datos minimos de actividad para mostrar en la home: id y nombre
    // const [actividadesMinimas, setActividadesMinimas] = useState<{ id: number; titulo: string }[]>([]);
    //datos minimos de usuario: id, nombre
    const [usuariosMinimos, setUsuariosMinimos] = useState<Record<number, {
        idUsuario: number;
        nombreUsuario: string
    }>>({});

    //vuelvo a obtener las actividades por ser mas sencillo
    const [actividadesMinimas, setActividadesMinimas] =  useState<Record<number, {
        idActividad: number;
        titulo: string
    }>>({});


    const [filtros, setFiltros] = useState({
        titulo: "",
        ubicacion: "",
        participantesmax: "",
        publica: false,
        fecha: "",
        tags: [] as string[]
    });


    const {logout} = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getActividades();
                setActividades(data);
                const tags = await getTags();
                setTagsDisponibles(tags.map((t: any) => t.nombre));
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);
    useEffect(() => {

        const fetchActividades = async () => {

            const params = new URLSearchParams();

            if (filtros.titulo) params.append("titulo", filtros.titulo);
            if (filtros.ubicacion) params.append("ubicacion", filtros.ubicacion);
            if (filtros.participantesmax) params.append("participantesmax", filtros.participantesmax);
            if (filtros.publica) params.append("publica", "true");
            if (filtros.fecha) params.append("fecha", filtros.fecha);
            if (filtros.tags.length > 0) {
                params.append("tags", filtros.tags.join(","));
            }


            const response = await getActividadesFiltro(params.toString())

            const data = await response;
            console.log(data);
            setActividades(data);
        };
        const timeout = setTimeout(() => { // Agrega un retraso de 300ms para evitar llamadas excesivas
            fetchActividades();
        }, 300);

        return () => clearTimeout(timeout);

    }, [filtros]);


    //logica para mostrar lista de chats
    //1. obtener todos los chats del usuario una lista de chat individual y otra de chat actividad
    //2. obtener el ultimo mensaje de cada chat
    //3. mostrar en el dropdown del usuario los chats ordenados por fecha del ultimo mensaje, mostrando el nombre del chat (nombre de la actividad o del otro usuario) y el ultimo mensaje
    //4. obtener el nombre, id e imagen(en un futuro imgen de perfil) del otro usuario para los chats
    //5. obtener el nombre, id e imagen(en un futuro imgen de perfil) de la actividad para los chats de actividad


    //carga los chat actividad y los chats individuales del usuario
    useEffect(() => {
        const fetchChats = async () => {
            if (isAuthenticated) {
                try {
                    // Aquí deberías llamar a tus servicios para obtener los chats del usuario
                    const data = await getMisChatsIndividual();
                    setChatsIndividuales(data);

                    const data2 = await getMisChatsActividad();
                    setChatsActividad(data2);

                } catch (error) {
                    console.error("Error al cargar los chats:", error);
                }
            }
            console.log("chats actividad", chatsActividad);
            console.log("chats individuales", chatsIndividuales);


        }
        fetchChats()
    }, []);

    //obtiene los messajes de un chat individual o de un chat de actividad y los mapea por su id para tenerlos todos en un mismo vector y usarlos así: ultimosMensajes[chatsIndividuales.ultimoMensaje] o ultimosMensajes[chatsActividad.ultimoMensaje]


    useEffect(() => {
        let cancelled = false;

        const fetchUltimosMensajes = async () => {
            const mensajesMap: { [key: number]: string } = {};
            try {
                // recopilar ids únicos y válidos (>0)
                const ids = new Set<number>();
                for (const chat of chatsIndividuales) {
                    const id = Number(chat.ultimoMensaje);
                    if (Number.isInteger(id) && id > 0) ids.add(id);
                }
                for (const chat of chatsActividad) {
                    const id = Number(chat.ultimoMensaje);
                    if (Number.isInteger(id) && id > 0) ids.add(id);
                }

                if (ids.size === 0) {
                    if (!cancelled) setUltimosMensajes({});
                    return;
                }

                // obtener mensajes en paralelo y construir el mapa
                const results = await Promise.all(
                    Array.from(ids).map(async (id) => {
                        try {
                            const mensaje = await getMensajePorId(id);
                            return mensaje && mensaje.contenido ? { id, contenido: mensaje.contenido } : null;
                        } catch (e) {
                            console.error('Error al obtener mensaje', id, e);
                            return null;
                        }
                    })
                );

                for (const r of results) {
                    if (r) mensajesMap[r.id] = r.contenido;
                }

                if (!cancelled) setUltimosMensajes(mensajesMap);
                console.log('mensajesMap', mensajesMap);
            } catch (err) {
                console.error('fetchUltimosMensajes error', err);
            }
        };

        fetchUltimosMensajes();

        return () => {
            cancelled = true;
        };
    }, [chatsIndividuales, chatsActividad]);

    //sacamos los id de los usuarios con los que tenemos chat individual para obtener los datos minimos y los mapea por el id del chatIndividual

    useEffect(() => {
        let cancelled = false;

        const fetchUsuariosMinimos = async () => {
            const usuariosMap: Record<number, { idUsuario: number; nombreUsuario: string }> = {};
            const cachePorUsuario: Record<number, { idUsuario: number; nombreUsuario: string } | null> = {};

            try {
                // solicitar datos en paralelo pero asegurando que cada usuario se pida una sola vez
                await Promise.all(
                    chatsIndividuales.map(async (chat: any) => {
                        const idOtroUsuario = chat.idUsuario1 === idUsuario ? chat.idUsuario2 : chat.idUsuario1;
                        if (!idOtroUsuario) return;

                        if (cachePorUsuario[idOtroUsuario] === undefined) {
                            try {
                                const datosMinimos = await getDatosMinimosUsuario(idOtroUsuario);
                                cachePorUsuario[idOtroUsuario] = datosMinimos ?? null;
                            } catch (e) {
                                console.error('Error obteniendo datosMinimos usuario', idOtroUsuario, e);
                                cachePorUsuario[idOtroUsuario] = null;
                            }
                        }

                        // guardar por idChatIndividual para usar en la UI
                        if (cachePorUsuario[idOtroUsuario]) {
                            usuariosMap[chat.idChatIndividual] = cachePorUsuario[idOtroUsuario] as { idUsuario: number; nombreUsuario: string };
                        }
                    })
                );

                console.log('usuariosMap', usuariosMap);
                if (!cancelled) setUsuariosMinimos(usuariosMap);
            } catch (e) {
                console.error('fetchUsuariosMinimos error', e);
            }
        };

        fetchUsuariosMinimos();

        return () => {
            cancelled = true;
        };
    }, [chatsIndividuales, idUsuario]);

    //obtenemos los datos basicos de las actividades con chat para mostrar el nombre de la actividad en el chat de actividad y los mapea por el id del chatActividad

    useEffect(() => {
        const fetchActividadesMinimas = async () => {
            const actividadesMap: Record<number, { idActividad: number; titulo: string }> = {};

            for (const chat of chatsActividad) {
                if (!actividadesMap[chat.idActividad]) {
                    const datosBasicos = await getDatosMinimosActividadPorId(chat.idActividad);
                    if (datosBasicos) {
                        actividadesMap[chat.idChatActividad] = { idActividad: chat.idActividad, titulo: datosBasicos.titulo };
                    }
                }
            }

            setActividadesMinimas(actividadesMap);
        };

        fetchActividadesMinimas();
    }, [chatsActividad]);


    //obtiene los id de los usuarios del array de las actividades,
    //hace un map ordenado por id de los usuario(datos minimos)
  /*  useEffect(() => {
        const fetchUsuariosMinimosActividades = async () => {
            const usuariosMap: Record<number, { idUsuario: number; nombreUsuario: string }> = {};

            for (const actividad of actividades) {
                if (actividad.idCreador) {
                    const idCreador = actividad.idCreador;
                    if (!usuariosMap[idCreador]) {
                        const datosMinimos = await getDatosMinimosUsuario(idCreador);
                        if (datosMinimos) {
                            usuariosMap[idCreador] = datosMinimos;
                        }
                    }
                }
            }

            setUsuariosMinimos(usuariosMap);
        };

        fetchUsuariosMinimosActividades();
    }, [actividades]);*/

    //numero de participantes de cada actividad
    useEffect(() => {
        const fetchParticipantes = async () => {
            const participacionesMap: Record<number, number> = {};

            for (const actividad of actividades) {
                if (actividad.idActividad) {
                    const numeroParticipantes = await getNumeroParticipantes(actividad.idActividad);
                    if (numeroParticipantes !== undefined) {
                        participacionesMap[actividad.idActividad] = numeroParticipantes;
                    }
                }
            }

            setParticipaciones(participacionesMap);
        };

        fetchParticipantes();
    }, [actividades]);

    return (
        <div

            className="min-h-screen bg-[#EEF2FB]"
            style={{fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif"}}
        >
            <div className="max-w-[1200px] mx-auto px-6 py-6">
                {/* ========== TOP BAR ========== */}
                <header className="flex items-center gap-3">
                    {/* Buscador */}
                    <div className="flex-1 max-w-md relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral"/>
                        <input
                            type="text"
                            placeholder="Buscar título..."
                            value={filtros.titulo}
                            onChange={(e) =>
                                setFiltros({...filtros, titulo: e.target.value})
                            }
                            className="w-full bg-white rounded-full pl-11 pr-4 py-3 text-sm text-secondary placeholder-neutral outline-none focus:ring-2 focus:ring-primary-100 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                        />
                    </div>

                    {/* Filtros */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-secondary font-semibold text-sm hover:bg-slate-50 transition shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                            >
                                <SlidersHorizontal className="w-4 h-4"/>
                                Filtros
                            </button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="end"
                            className="w-80 p-5 rounded-2xl bg-white border border-slate-200 shadow-xl"
                        >
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-neutral uppercase tracking-wider">
                                        Ubicación
                                    </label>
                                    <input
                                        placeholder="Ubicación"
                                        value={filtros.ubicacion}
                                        onChange={(e) =>
                                            setFiltros({...filtros, ubicacion: e.target.value})
                                        }
                                        className="mt-1 w-full bg-slate-50 rounded-lg px-3 py-2 text-sm text-secondary outline-none focus:ring-2 focus:ring-primary-100"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-neutral uppercase tracking-wider">
                                        Máx participantes
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Máx participantes"
                                        value={filtros.participantesmax}
                                        onChange={(e) =>
                                            setFiltros({
                                                ...filtros,
                                                participantesmax: e.target.value,
                                            })
                                        }
                                        className="mt-1 w-full bg-slate-50 rounded-lg px-3 py-2 text-sm text-secondary outline-none focus:ring-2 focus:ring-primary-100"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-neutral uppercase tracking-wider">
                                        Fecha inicio desde
                                    </label>
                                    <input
                                        type="date"
                                        value={filtros.fecha}
                                        onChange={(e) =>
                                            setFiltros({...filtros, fecha: e.target.value})
                                        }
                                        className="mt-1 w-full bg-slate-50 rounded-lg px-3 py-2 text-sm text-secondary outline-none focus:ring-2 focus:ring-primary-100"
                                    />
                                </div>

                                <label className="flex items-center gap-2 text-sm text-secondary cursor-pointer">
                                    <Checkbox
                                        checked={filtros.publica}
                                        onCheckedChange={(v) =>
                                            setFiltros({...filtros, publica: v === true})
                                        }
                                    />
                                    Solo públicas
                                </label>

                                {tagsDisponibles.length > 0 && (
                                    <div>
                                        <div
                                            className="text-xs font-semibold text-neutral uppercase tracking-wider mb-2">
                                            Tags
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {tagsDisponibles.map((tag) => {
                                                const active = filtros.tags.includes(tag);
                                                return (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        onClick={() =>
                                                            setFiltros({
                                                                ...filtros,
                                                                tags: active
                                                                    ? filtros.tags.filter((t) => t !== tag)
                                                                    : [...filtros.tags, tag],
                                                            })
                                                        }
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                                                            active
                                                                ? "bg-primary text-white"
                                                                : "bg-neutral-light text-neutral hover:bg-slate-200"
                                                        }`}
                                                    >
                                                        {tag}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Campanita */}
                    {isAuthenticated && (
                        <Link to="/notificaciones">
                            <button
                                type="button"
                                className="relative w-11 h-11 rounded-full bg-white flex items-center justify-center text-neutral hover:text-secondary transition shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                                aria-label="Notificaciones"
                            >
                                <Bell className="w-5 h-5"/>
                                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-tertiary"/>
                            </button>
                        </Link>
                    )}

                    {/* Usuario */}
                    {!isAuthenticated ? (
                        <Link to="/login">
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-600 transition"
                            >
                                <LogIn className="w-4 h-4"/>
                                Log in
                            </button>
                        </Link>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-600 transition"
                                    aria-label="Usuario"
                                >
                                    <User className="w-5 h-5"/>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-52 rounded-xl bg-white border border-slate-200 shadow-xl"
                            >
                                {idUsuario != null && (
                                    <DropdownMenuItem asChild>
                                        <Link to={`/usuario/${idUsuario}`}>Mi perfil</Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem asChild>
                                    <Link to="/misActividades">Mis actividades</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to="/actividad/crear">Crear actividad</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to="/settings">Ajustes</Link>
                                </DropdownMenuItem>
                                {rol === "admin" && (
                                    <DropdownMenuItem asChild>
                                        <Link to="/admin/crearTag">Gestionar tags</Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator/>
                                <DropdownMenuItem
                                    onClick={() => logout()}
                                    className="text-red-600 focus:text-red-700"
                                >
                                    <LogOut className="w-4 h-4 mr-2"/>
                                    Cerrar sesión
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </header>

                {/* ========== TÍTULO ========== */}
                <section className="mt-10">
                    <h1
                        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-secondary tracking-tight"
                        style={{fontFamily: "'Manrope', sans-serif"}}
                    >
                        Actividades disponibles
                    </h1>
                </section>

                {/* ========== LISTA DE ACTIVIDADES ========== */}
                <section className="mt-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {actividades.map((act) => {
                            const imagenUrl: string | null = act.imagenes ?? null;
                            const creadorNombre: string =
                                usuariosMinimos[act.idCreador]?.nombreUsuario ?? "Nombre creador";
                            const creadorFoto: string | null = act.creador?.foto ?? null;
                            const fecha: string = act.fechaInicio ?? "12 Jun • 19:00";
                            const ubicacion: string = act.ubicacion ?? "Ubicación de ejemplo";
                            const participantes: number = participaciones[act?.idActividad] ?? 3;
                            const participantesMax: number = act.participantesmax ?? 10;

                            return (
                                <Link
                                    key={act.idActividad}
                                    to={`/actividad/${act.idActividad}`}
                                    className="group rounded-3xl bg-white shadow-[0_2px_20px_rgba(15,23,42,0.06)] p-4 flex flex-col transition hover:shadow-[0_12px_30px_rgba(15,23,42,0.10)] hover:-translate-y-0.5 no-underline"
                                >
                                    {/* Imagen con fallback negro */}
                                    <div className="relative w-full aspect-[4/3] rounded-2xl bg-black overflow-hidden">
                                        {imagenUrl && (
                                            <img
                                                src={imagenUrl}
                                                alt={act.titulo}
                                                className="absolute inset-0 w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).style.display =
                                                        "none";
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* Contenido */}
                                    <div className="px-2 pt-5 pb-2 flex flex-col flex-1">
                                        <h3
                                            className="text-[19px] font-extrabold text-secondary leading-snug tracking-tight group-hover:text-primary transition"
                                            style={{fontFamily: "'Manrope', sans-serif"}}
                                        >
                                            {act.titulo}
                                        </h3>

                                        <div className="mt-4 space-y-2.5 text-neutral text-sm">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-primary"/>
                                                <span className="truncate">{ubicacion}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-primary"/>
                                                <span>{fecha}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-primary"/>
                                                <span>
                          {participantesMax === 0 ? (
                              <>{participantes} sin límite</>
                          ) : (
                              <>{participantes}/{participantesMax} participantes</>
                          )}
                        </span>
                                            </div>
                                        </div>

                                        {/* Creador */}
                                        <div className="mt-auto pt-6 flex items-center gap-2">
                                            <div
                                                className="w-7 h-7 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-white text-xs font-semibold">
                                                {creadorFoto ? (
                                                    <img
                                                        src={creadorFoto}
                                                        alt={creadorNombre}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.currentTarget as HTMLImageElement).style.display =
                                                                "none";
                                                        }}
                                                    />
                                                ) : (
                                                    creadorNombre.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <span className="text-secondary text-sm font-medium truncate">
                        {creadorNombre}
                      </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}

                        {actividades.length === 0 && (
                            <div className="col-span-full text-center py-16 text-neutral">
                                No hay actividades que mostrar.
                            </div>
                        )}
                    </div>
                </section>

                {/*Muestra los chats*/}
                <section>


                    <h2 className="text-2xl font-bold text-secondary mt-16 mb-6">Mis Chats Individuales</h2>
                    <div className="space-y-4">
                        {chatsIndividuales.map((chat) => (
                            <Link
                                key={chat.idChatIndividual}
                                to={`/ChatIndividual/${chat.idChatIndividual}`}
                            >
                                <div className="p-4 bg-white rounded-lg shadow">
                                    <h3 className="text-lg font-semibold text-secondary">
                                        Chat Individual ID: {chat.idChatIndividual}
                                    </h3>
                                    <h2>
                                        Usuario: {usuariosMinimos[chat.idChatIndividual]?.nombreUsuario }
                                    </h2>
                                    <p className="text-sm text-neutral">
                                        Último mensaje: {ultimosMensajes[Number(chat.ultimoMensaje)] ?? 'Sin mensajes'}
                                    </p>
                                </div>
                            </Link>
                        ))}
                        {chatsIndividuales.length === 0 && (
                            <p className="text-sm text-neutral">No tienes chats individuales.</p>
                        )}
                    </div>
                   


                        <h2 className="text-2xl font-bold text-secondary mt-16 mb-6">Mis Chats de Actividad </h2>
                        <div className="space-y-4">
                            {chatsActividad.map((chat) => (
                                <Link to={`/ChatActividad/${chat.idChatActividad}`}>
                                <div key={chat.idChatActividad} className="p-4 bg-white rounded-lg shadow">
                                    <h3 className="text-lg font-semibold text-secondary">Chat Actividad
                                        ID: {chat.idChatActividad}</h3>

                                    <h2>Actividad {actividadesMinimas[chat.idChatActividad]?.titulo}</h2>
                                    <p className="text-sm text-neutral">Último mensaje
                                        : {ultimosMensajes[chat.ultimoMensaje] ?? 'Sin mensajes'}</p>
                                </div> </Link>
                            ))}
                            {chatsActividad.length === 0 && (
                                <p className="text-sm text-neutral">No tienes chats de actividad.</p>
                            )}
                        </div>


                </section>
            </div>
        </div>
    );
}
