// TypeScript
import {useEffect, useState} from "react";
import {getActividadesFiltro} from "../services/actividadService";
import {useAuth} from "../context/AuthContext";
import {Link} from "react-router-dom";
import {getActividades, getDatosMinimosActividadPorId} from "../services/actividadService.ts";
import {getDatosMinimosUsuario} from "../services/usuarioService.ts";
import {getTags} from "../services/tagService.ts";
/*import {getMySettings} from "../services/settingsService.ts";
import type {Settings} from "../types.ts";*/
import '../index.css';

import {getNumeroParticipantes} from "../services/participacionService.ts";

import {getMensajePorId} from "../services/mensajeService.ts";
//estilo
//import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
//importar index.css para estilos globales

import {MessageCircle} from "lucide-react"; // añádelo a tu línea de lucide-react
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../components/ui/sheet"

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
import {getMisChatsActividad, getMisChatsIndividual,} from "../services/chatService.ts";


export default function Home() {
    const [actividades, setActividades] = useState<any[]>([]);
    const {isAuthenticated, idUsuario, rol} = useAuth();
    const [tagsDisponibles, setTagsDisponibles] = useState<string[]>([]);
    const [chatsActividad, setChatsActividad] = useState<any[]>([]);
    const [chatsIndividuales, setChatsIndividuales] = useState<any[]>([]);
    const [ultimosMensajes, setUltimosMensajes] = useState<{ [key: number]: string }>({});
    const [participaciones, setParticipaciones] = useState<Record<number, number>>({}); // Mapa de idActividad a número de participantes
    //const [misIdTags, setMisIdTags] = useState<number[]>([]); // IDs de los tags que tengo en settigs

    //datos minimos de actividad para mostrar en la home: id y nombre
    // const [actividadesMinimas, setActividadesMinimas] = useState<{ id: number; titulo: string }[]>([]);
    //datos minimos de usuario: id, nombre
    const [usuariosMinimos, setUsuariosMinimos] = useState<Record<number, {
        idUsuario: number;
        nombreUsuario: string;
        imagen: string | undefined;

    }>>({});

    const [misdatosMinimos, setMisDatosMinimos] = useState<{
        idUsuario: number;
        nombreUsuario: string;
        imagen: string | undefined;

    } | null>(null);

    const [usuariosMinimosActividad, setUsuariosMinimosActividad] = useState<Record<number, {
        idUsuario: number;
        nombreUsuario: string;
        imagen: string | undefined;

    }>>({});

    //vuelvo a obtener las actividades por ser mas sencillo
    const [actividadesMinimas, setActividadesMinimas] = useState<Record<number, {
        idActividad: number;
        titulo: string
    }>>({});


    const [filtros, setFiltros] = useState({
        titulo: "",
        ubicacion: "",
        participantesmax: "",
        publica: false,
        fecha: "",
        tags: [] as string[],
        soloActivas: true
    });


    const {logout} = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getActividades();
                setActividades(data);
                const tags = await getTags();
                setTagsDisponibles(tags.map((t: any) => t.nombre));

                //carga al usuario minimo
                if (isAuthenticated && idUsuario != null) {
                    const datosMinimos = await getDatosMinimosUsuario(Number(idUsuario));
                    setMisDatosMinimos(datosMinimos);
                }


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
            if (filtros.soloActivas) params.append("estado", "activa");

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



        }
        fetchChats()
    }, []);


    //obtener los tags(preferencias) del usuario para mostrarlos en el filtro de tags
   /* useEffect(() => {
        const fetchSettings = async () => {
            if (isAuthenticated) {
                try {
                    const settings: Settings = await getMySettings();
                    const idTags = settings.preferencias || [];
                    setMisIdTags(idTags);
                    // Si quieres mostrar los nombres de los tags en lugar de los IDs, puedes hacer una llamada adicional para obtener los nombres de los tags aquí.
                } catch (error) {
                    console.error("Error al cargar la configuración del usuario:", error);
                }
            }
        };

        fetchSettings();
    }, [isAuthenticated]);
*/

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
                            return mensaje && mensaje.contenido ? {id, contenido: mensaje.contenido} : null;
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
            const usuariosMap: Record<number, {
                idUsuario: number;
                nombreUsuario: string;
                imagen: string | undefined
            }> = {};
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
                            usuariosMap[chat.idChatIndividual] = cachePorUsuario[idOtroUsuario] as {
                                idUsuario: number;
                                nombreUsuario: string;
                                imagen: string | undefined
                            };
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
                        actividadesMap[chat.idChatActividad] = {
                            idActividad: chat.idActividad,
                            titulo: datosBasicos.titulo
                        };
                    }
                }
            }

            setActividadesMinimas(actividadesMap);
        };

        fetchActividadesMinimas();
    }, [chatsActividad]);


    //obtiene los id de los usuarios del array de las actividades,
    //hace un map ordenado por id de los usuario(datos minimos)
    useEffect(() => {
        const fetchUsuariosMinimosActividades = async () => {
            const usuariosMap: Record<number, {
                idUsuario: number;
                nombreUsuario: string;
                imagen: string | undefined
            }> = {};

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

            setUsuariosMinimosActividad(usuariosMap);
        };

        fetchUsuariosMinimosActividades();
    }, [actividades]);

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

                                <label className="flex items-center gap-2 text-sm text-secondary cursor-pointer">
                                    <Checkbox
                                        checked={filtros.soloActivas}
                                        onCheckedChange={(v) =>
                                            setFiltros({...filtros, soloActivas: v === true})
                                        }
                                    />
                                    Mostrar solo activas
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

                    {/* Chats (drawer) */}
                    {isAuthenticated && (
                        <Sheet>
                            <SheetTrigger asChild>
                                <button
                                    type="button"
                                    className="relative w-11 h-11 rounded-full bg-white flex items-center justify-center text-neutral hover:text-secondary transition shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                                    aria-label="Mis chats"
                                >
                                    <MessageCircle className="w-5 h-5"/>
                                    {(chatsIndividuales.length > 0 || chatsActividad.length > 0) && (
                                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary"/>
                                    )}
                                </button>
                            </SheetTrigger>

                            <SheetContent
                                side="right"
                                className="w-[90vw] sm:w-[420px] bg-[#F8F9FB] border-l border-slate-200 overflow-y-auto p-6"
                            >
                                <SheetHeader className="mb-4">
                                    <SheetTitle
                                        className="text-2xl font-extrabold text-secondary"
                                        style={{fontFamily: "'Manrope', sans-serif"}}
                                    >
                                        Mis chats
                                    </SheetTitle>
                                </SheetHeader>

                                {/* Chats individuales */}
                                {chatsIndividuales.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-xs font-bold tracking-[0.18em] text-neutral uppercase mb-3">
                                            Individuales
                                        </h3>
                                        <div className="space-y-2">
                                            {chatsIndividuales.map((chat) => {
                                                const usuario = usuariosMinimos[chat?.idChatIndividual];
                                                const imagen = usuario?.imagen ?? null;
                                                return (
                                                    <Link
                                                        key={chat.idChatIndividual}
                                                        to={`/ChatIndividual/${chat.idChatIndividual}`}
                                                        className="flex gap-3 items-center p-3 bg-white rounded-2xl hover:bg-neutral-light transition"
                                                    >
                                                        <div
                                                            className="w-11 h-11 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-white text-sm font-bold shrink-0">
                                                            {imagen ? (
                                                                <img
                                                                    src={imagen}
                                                                    alt={usuario?.nombreUsuario ?? "Usuario"}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) =>
                                                                        ((e.currentTarget as HTMLImageElement).style.display = "none")
                                                                    }
                                                                />
                                                            ) : (
                                                                (usuario?.nombreUsuario ?? "?").charAt(0).toUpperCase()
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-bold text-secondary truncate">
                                                                {usuario?.nombreUsuario ?? "Usuario"}
                                                            </div>
                                                            <p className="text-xs text-neutral truncate">
                                                                {ultimosMensajes[Number(chat.ultimoMensaje)] ?? "Sin mensajes"}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Chats de actividad */}
                                {chatsActividad.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-bold tracking-[0.18em] text-neutral uppercase mb-3">
                                            Actividades
                                        </h3>
                                        <div className="space-y-2">
                                            {chatsActividad.map((chat) => {
                                                const actividad = actividades.find(
                                                    (a: any) => a.idActividad === chat?.idActividad,
                                                );
                                                const imagen = actividad?.imagenes
                                                    ? Array.isArray(actividad.imagenes)
                                                        ? actividad.imagenes[0]
                                                        : actividad.imagenes
                                                    : null;
                                                return (
                                                    <Link
                                                        key={chat?.idChatActividad}
                                                        to={`/ChatActividad/${chat?.idChatActividad}`}
                                                        className="flex gap-3 items-center p-3 bg-white rounded-2xl hover:bg-neutral-light transition"
                                                    >
                                                        <div
                                                            className="w-16 h-11 rounded-lg bg-black overflow-hidden shrink-0">
                                                            {imagen && (
                                                                <img
                                                                    src={imagen}
                                                                    alt={actividadesMinimas[chat?.idChatActividad]?.titulo ?? "Actividad"}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) =>
                                                                        ((e.currentTarget as HTMLImageElement).style.display = "none")
                                                                    }
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-bold text-secondary truncate">
                                                                {actividadesMinimas[chat?.idChatActividad]?.titulo ?? "Actividad"}
                                                            </div>
                                                            <p className="text-xs text-neutral truncate">
                                                                {ultimosMensajes[chat?.ultimoMensaje] ?? "Sin mensajes"}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Empty state */}
                                {chatsIndividuales.length === 0 && chatsActividad.length === 0 && (
                                    <div className="text-center text-sm text-neutral py-10">
                                        Aún no tienes chats.
                                    </div>
                                )}
                            </SheetContent>
                        </Sheet>
                    )}

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
                                    className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-600 transition overflow-hidden"
                                    aria-label="Usuario"
                                    style={
                                        misdatosMinimos?.imagen
                                            ? {
                                                backgroundImage: `url(${misdatosMinimos.imagen})`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                            }
                                            : undefined
                                    }
                                >
                                    {!misdatosMinimos?.imagen && <User className="w-5 h-5"/>}
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
                                    <Link to={`/usuario/${idUsuario}/actividadesCreadas`}>Mis actividades</Link>
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
                                usuariosMinimosActividad[act.idCreador]?.nombreUsuario ?? "Nombre creador";
                            const creadorFoto: string | null = usuariosMinimosActividad[act.idCreador]?.imagen ?? null;
                            const fecha = new Date(act.fechaInicio).toLocaleDateString() ?? "No determinada";
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
                                    <div className="relative w-full aspect-[5/3] rounded-2xl bg-black overflow-hidden">
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


            </div>
        </div>
    );
}
