//Muestra el chat de una actividad específica. El ID de la actividad se obtiene de la URL.

import {Navigate, useParams} from "react-router-dom";
//import {getChatActividad} from "../services/chatService";
import {crearMensajeChat, getMensajesActividad} from "../services/mensajeService";
import type { Mensaje} from "../types.ts";
import {useAuth} from "../context/AuthContext.tsx";
import {getDatosMinimosUsuario} from "../services/usuarioService.ts";
import type {UsuarioMinimo, ActividadMinima} from "../types.ts";
import {getChatActividadPorIdChat} from "../services/chatService.ts";
import {getDatosMinimosActividadPorId} from "../services/actividadService.ts";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Send, ArrowLeft, Users } from "lucide-react";
import TopBar from "../components/ui/TopBar.tsx";

export default function VistaChatActividad() {
    //   const {idActividad} = useParams<{ idActividad: string }>();
//    const [chat, setChat] = useState<ChatActividad | null>(null);
//    const [error, setError] = useState("");
    const {loading, idUsuario, isAuthenticated} = useAuth();
    const idSesion = idUsuario;
    const [mensajes, setMensajes] = useState<Mensaje[] | null>(null);//
    const {idChatActividad} = useParams<{ idChatActividad: string }>();
    const [contenidoNuevoMensaje, setContenidoNuevoMensaje] = useState("");
    const [mapUsuariosMinimos, setMapUsuariosMinimos] = useState<{ [idUsuario: number]: UsuarioMinimo }>({});
    const [actividad, setActividad] = useState<ActividadMinima | null>(null);



    // Si estamos inicializando el provider esperar
    if (loading) {
        return <div>loading...</div>;
    }

    // Si no esta autenticado, redirigir a login (o mostrar mensaje de no autorizado)
    if (!isAuthenticated) {
        return <Navigate to="/login" replace/>;
    }

    // Si esta autenticado pero ayn no podemos obtener idUsuario, esperar (posible token inválido)
    if (idSesion == null) {
        return <div>Cargando sesión...</div>;
    }
    /*
        useEffect(() => {// Cargar el chat de la actividad al montar el componente
            const cargarChat = async () => {
                try {
                    const chatData = await getChatActividad(Number(idActividad));
                    //if es un chat
                    if (typeof chatData !== "boolean") {
                        setChat(chatData);
                    }


                } catch (err) {
                    console.error("Error cargando chat:", err);
                    setError("Error al cargar el chat de la actividad");
                }
            };

            cargarChat();
        }, [idActividad]);
    */

    useEffect(() => {
        const fetchData = async () => {
            let mounted = true;
            let isFetching = false;
            const cargarMensajes = async () => {
                try {
                    if (!isAuthenticated || idSesion == null) return;
                    if (isFetching) return; // ya hay una petición en curso
                    isFetching = true;
                    const data = await getMensajesActividad(Number(idChatActividad));
                    if (!mounted) return;
                    setMensajes(data);
                } catch (error) {
                    console.error(error);
                } finally {
                    isFetching = false;
                }
            };

            // carga inicial
            void cargarMensajes();

            // cada 3 segundos
            const interval = setInterval(() => {
                void cargarMensajes();
            }, 40000);//

            return () => {
                mounted = false;
                clearInterval(interval);
            };
        };
        fetchData();
    }, [idChatActividad, isAuthenticated, idSesion]);
    /*
        if (!mensajes) {
            return <div>Cargando...</div>;
        }
    */

    //cargamos los usuarios de los mensajes por orden de idUsuario, para evitar hacer peticiones repetidas
    useEffect(() => {
        const cargarUsuarios = async () => {
            if (mensajes) {
                const idEmisores = Array.from(new Set(mensajes.map(m => m.idEmisor)));// obtenemos los ids de los emisores
                const nuevosUsuarios: { [idUsuario: number]: UsuarioMinimo } = {};
                for (const id of idEmisores) {
                    if (!mapUsuariosMinimos[id]) { // si no lo tenemos ya cargado
                        try {
                            const usuario = await getDatosMinimosUsuario(id);
                            nuevosUsuarios[id] = usuario;
                        } catch (error) {
                            console.error(`Error cargando usuario ${id}:`, error);
                        }
                    }
                }
                setMapUsuariosMinimos(prev => ({...prev, ...nuevosUsuarios}));
            }
        };
        cargarUsuarios();
    }, [mensajes]);

    //carga la actividad para mostrar su nombre en el header del chat
    useEffect(() => {
        const cargarActividad = async () => {
            try {
                const chatData = await getChatActividadPorIdChat(Number(idChatActividad));
                if (typeof chatData === "boolean") {
                    console.error("No se encontró el chat de la actividad");
                    return;
                }
                const data = await getDatosMinimosActividadPorId(Number(chatData.idActividad));
                setActividad(data);
            } catch (error) {
                console.error("Error cargando actividad:", error);
            }
        };
        cargarActividad();
    }, [idChatActividad]);

    const handleEnviarMensaje = async (contenido: string) => {
        await crearMensajeChat({
            idChatActividad: Number(idChatActividad),
            contenido: contenido,
        });

        //actualizar la lista de mensajes después de enviar uno nuevo
        const data = await getMensajesActividad(Number(idChatActividad));
        setMensajes(data);
        setContenidoNuevoMensaje("");
    };

    const obtenerPrimeraImagenActividad = (imagenes?: string | string[]) => {
        if (!imagenes) return undefined;
        return Array.isArray(imagenes) ? imagenes[0] : imagenes;
    };

    const mensajesEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [mensajes]);

    const imgActividad = obtenerPrimeraImagenActividad((actividad as any)?.imagen);

    return (
        <div className="min-h-screen bg-[#F8F9FB]">
            <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 flex flex-col h-screen">
                <TopBar />

                <div className="flex-1 min-h-0 bg-white rounded-3xl shadow-sm flex flex-col overflow-hidden">
                    {/* --- Cabecera del chat (actividad) --- */}
                    <header className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                        <Link
                            to="/"
                            className="sm:hidden w-9 h-9 rounded-full flex items-center justify-center text-neutral hover:bg-neutral-light transition"
                            aria-label="Volver"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>

                        <Link
                            to={`/actividad/${actividad?.idActividad}`}
                            className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition"
                        >
                            <div className="w-11 h-11 rounded-full bg-primary overflow-hidden flex items-center justify-center text-white font-bold shrink-0">
                                {imgActividad ? (
                                    <img
                                        src={typeof imgActividad === "string" ? imgActividad : undefined}
                                        alt={actividad?.titulo || "Actividad"}
                                        className="w-full h-full object-cover"
                                        onError={(e) =>
                                            ((e.currentTarget as HTMLImageElement).style.display = "none")
                                        }
                                    />
                                ) : (
                                    <Users className="w-5 h-5" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <div
                                    className="font-extrabold text-secondary truncate"
                                    style={{ fontFamily: "'Manrope', sans-serif" }}
                                >
                                    {actividad?.titulo || "Chat de actividad"}
                                </div>
                                <div className="text-xs text-neutral">
                                    Chat grupal
                                </div>
                            </div>
                        </Link>
                    </header>

                    {/* --- Lista de mensajes --- */}
                    <div
                        className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-2 bg-[#F8F9FB]"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 20% 10%, rgba(0,86,210,0.04) 0, transparent 40%), radial-gradient(circle at 80% 90%, rgba(0,229,255,0.05) 0, transparent 40%)",
                        }}
                    >
                        {!mensajes || mensajes.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-neutral text-sm">
                                No hay mensajes todavía. ¡Rompe el hielo!
                            </div>
                        ) : (
                            mensajes.map((mensaje, index) => {
                                const esPropio = mensaje.idEmisor === idSesion;
                                const prevEmisor = mensajes[index - 1]?.idEmisor ?? null;
                                const showHeader = !esPropio && mensaje.idEmisor !== prevEmisor;
                                const cambioEmisor = mensaje.idEmisor !== prevEmisor;
                                const usuario = mapUsuariosMinimos[mensaje.idEmisor];

                                return (
                                    <div
                                        key={mensaje.idMensaje}
                                        className={`flex ${
                                            esPropio ? "justify-end" : "justify-start"
                                        } ${cambioEmisor ? "mt-3" : "mt-0.5"}`}
                                    >
                                        {/* Avatar (columna fija para mensajes ajenos) */}
                                        {!esPropio && (
                                            <div className="w-9 shrink-0 mr-2 self-end">
                                                {showHeader && (
                                                    <Link
                                                        to={`/usuario/${mensaje.idEmisor}`}
                                                        className="block w-9 h-9 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-white text-xs font-bold hover:opacity-80 transition"
                                                    >
                                                        {usuario?.imagen ? (
                                                            <img
                                                                src={
                                                                    typeof usuario?.imagen === "string"
                                                                        ? usuario.imagen
                                                                        : Array.isArray(usuario?.imagen)
                                                                            ? usuario.imagen[0]
                                                                            : undefined
                                                                }
                                                                alt={usuario.nombreUsuario || "Usuario"}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) =>
                                                                    ((e.currentTarget as HTMLImageElement).style.display =
                                                                        "none")
                                                                }
                                                            />
                                                        ) : (
                                                            (usuario?.nombreUsuario || "?")
                                                                .charAt(0)
                                                                .toUpperCase()
                                                        )}
                                                    </Link>
                                                )}
                                            </div>
                                        )}

                                        {/* Burbuja */}
                                        <div
                                            className={`max-w-[75%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl shadow-sm ${
                                                esPropio
                                                    ? "bg-primary text-white rounded-br-md"
                                                    : "bg-white text-secondary rounded-bl-md"
                                            }`}
                                        >
                                            {/* Nombre del emisor (solo ajeno + cambio de emisor) */}
                                            {showHeader && (
                                                <Link
                                                    to={`/usuario/${mensaje.idEmisor}`}
                                                    className="block text-[11px] font-bold text-primary hover:underline mb-0.5"
                                                >
                                                    {usuario?.nombreUsuario || "Usuario"}
                                                </Link>
                                            )}

                                            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                                                {mensaje.contenido}
                                            </p>

                                            <div
                                                className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                                                    esPropio ? "text-white/70" : "text-neutral"
                                                }`}
                                            >
                      <span>
                        {(mensaje as any).fecha
                            ? new Date((mensaje as any).fecha).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                            )
                            : ""}
                      </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={mensajesEndRef} />
                    </div>

                    {/* --- Input --- */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (!contenidoNuevoMensaje.trim()) return;
                            handleEnviarMensaje(contenidoNuevoMensaje);
                            setContenidoNuevoMensaje("");
                        }}
                        className="flex items-center gap-3 px-4 sm:px-5 py-4 border-t border-slate-100 bg-white"
                    >
                        <input
                            type="text"
                            placeholder="Escribe un mensaje..."
                            value={contenidoNuevoMensaje}
                            onChange={(e) => setContenidoNuevoMensaje(e.target.value)}
                            className="flex-1 bg-neutral-light rounded-full px-5 py-3 text-sm text-secondary placeholder-neutral outline-none focus:ring-2 focus:ring-primary-100"
                        />
                        <button
                            type="submit"
                            disabled={!contenidoNuevoMensaje.trim()}
                            className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-600 transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shrink-0"
                            aria-label="Enviar"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}