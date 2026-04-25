//muestra los mensajes entre dos usuarios, con un input para enviar nuevos mensajes
import {useCallback, useEffect,  useState} from "react";
import {getMensajesIndividual, crearMensajeChat, marcarMensajeComoLeidoIndividual} from "../services/mensajeService";
import {useParams, Navigate, Link} from "react-router-dom";
import type {Mensaje} from '../types';
import { useAuth } from "../context/AuthContext";
import { Send, ArrowLeft, Check, CheckCheck } from "lucide-react";
import TopBar from "../components/ui/TopBar.tsx";

export default function VistaChatIndividual() {
    const {idChatIndividual} = useParams<{ idChatIndividual: string }>();
    const [mensajes, setMensajes] = useState<Mensaje[] | null>(null);
    const [contenidoNuevoMensaje, setContenidoNuevoMensaje] = useState("");

    const { loading, idUsuario, isAuthenticated } = useAuth();
    const idSesion = idUsuario;

    // Si estamos inicializando el provider esperar
    if (loading) {
        return <div>Cargando...</div>;
    }

    // Si no esta autenticado, redirigir a login (o mostrar mensaje de no autorizado)
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Si esta autenticado pero ayn no podemos obtener idUsuario, esperar (posible token inválido)
    if (idSesion == null) {
        return <div>Cargando sesión...</div>;
    }

    const marcarLeidos = useCallback(async (data: Mensaje[]| null) => {
        if (!data) return;
        for (const mensaje of data) {
            // validar que idMensaje y idEmisor sean números válidos
            const idMensajeNum = Number(mensaje.idMensaje);
            if (!mensaje.leido && (mensaje.idEmisor != idSesion) && Number.isFinite(idMensajeNum)) {
                console.log("marcarLeidos", idMensajeNum, "idSesion", idSesion, "idEmisor", mensaje.idEmisor);
                await marcarMensajeComoLeidoIndividual(idMensajeNum);
            }
        }
    }, [idSesion]);

    useEffect(() => {
        let mounted = true;
        let isFetching = false;
        const cargarMensajes = async () => {
            try {
                if (!isAuthenticated || idSesion == null) return;
                if (isFetching) return; // ya hay una petición en curso
                isFetching = true;
                const data = await getMensajesIndividual(Number(idChatIndividual));
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

        // polling cada 3 segundos
        const interval = setInterval(() => {
            void cargarMensajes();
        }, 3000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [idChatIndividual, isAuthenticated, idSesion]);

    // Efecto que marca como leídos una vez que tenemos mensajes y el id de sesión
    useEffect(() => {
        if (mensajes && idSesion) {
            marcarLeidos(mensajes).catch(err => console.error('Error marcando mensajes leídos:', err));
        }
    }, [mensajes, idSesion, marcarLeidos]);

    if (!mensajes) {
        return <div>Cargando...</div>;
    }



    //TODO ver por que no actualiza la lista de mensajes después de enviar uno nuevo, aunque si se guarda en la base de datos
    const handleEnviarMensaje = async (contenido: string) => {
        await crearMensajeChat({
            idChatIndividual: Number(idChatIndividual),
            contenido: contenido,
        });

        //actualizar la lista de mensajes después de enviar uno nuevo
        const data = await getMensajesIndividual(Number(idChatIndividual));
        setMensajes(data);
        setContenidoNuevoMensaje("");
    };


/*
*
*     const mensajesEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        mensajesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [mensajes]);

// Placeholder del usuario con el que hablas

    };
* */


    const otroUsuario = {
        idUsuario:  0,
        nombreUsuario:  "Usuario",
        foto:  null,
        online:  false,};

    return (
        <div className="min-h-screen bg-[#F8F9FB]">
            <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 flex flex-col h-screen">
                <TopBar />

                {/* ============ CONTENEDOR DEL CHAT ============ */}
                <div className="flex-1 min-h-0 bg-white rounded-3xl shadow-sm flex flex-col overflow-hidden">
                    {/* --- Cabecera del chat --- */}
                    <header className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                        {/* Volver (móvil) */}
                        <Link
                            to="/chats"
                            className="sm:hidden w-9 h-9 rounded-full flex items-center justify-center text-neutral hover:bg-neutral-light transition"
                            aria-label="Volver"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>

                        {/* Avatar + nombre → perfil */}
                        <Link
                            to={`/usuario/${otroUsuario.idUsuario}`}
                            className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition"
                        >
                            <div className="relative w-11 h-11 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-white font-semibold shrink-0">
                                {otroUsuario.foto ? (
                                    <img
                                        src={otroUsuario.foto}
                                        alt={otroUsuario.nombreUsuario}
                                        className="w-full h-full object-cover"
                                        onError={(e) =>
                                            ((e.currentTarget as HTMLImageElement).style.display = "none")
                                        }
                                    />
                                ) : (
                                    otroUsuario.nombreUsuario.charAt(0).toUpperCase()
                                )}
                                {otroUsuario.online && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-tertiary ring-2 ring-white" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <div
                                    className="font-extrabold text-secondary truncate"
                                    style={{ fontFamily: "'Manrope', sans-serif" }}
                                >
                                    {otroUsuario.nombreUsuario}
                                </div>
                                <div className="text-xs text-neutral">
                                    {otroUsuario.online ? "En línea" : "Desconectado"}
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
                        {mensajes.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-neutral text-sm">
                                No hay mensajes todavía. ¡Saluda!
                            </div>
                        ) : (
                            mensajes.map((mensaje, i) => {
                                const esMio = mensaje.idEmisor === idSesion;
                                const anterior = mensajes[i - 1];
                                const mismoEmisorQueAnterior =
                                    anterior && anterior.idEmisor === mensaje.idEmisor;

                                return (
                                    <div
                                        key={mensaje.idMensaje}
                                        className={`flex ${esMio ? "justify-end" : "justify-start"} ${
                                            mismoEmisorQueAnterior ? "mt-0.5" : "mt-3"
                                        }`}
                                    >
                                        <div
                                            className={`max-w-[75%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl shadow-sm ${
                                                esMio
                                                    ? "bg-primary text-white rounded-br-md"
                                                    : "bg-white text-secondary rounded-bl-md"
                                            }`}
                                        >
                                            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                                                {mensaje.contenido}
                                            </p>

                                            <div
                                                className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                                                    esMio ? "text-white/70" : "text-neutral"
                                                }`}
                                            >
                      <span>
                        {mensaje.fechaEnvio
                            ? new Date(mensaje.fechaEnvio).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            : "12:34"}
                      </span>
                                                {/* Indicador de leído (sólo en mis mensajes) */}
                                                {esMio &&
                                                    (mensaje.leido ? (
                                                        <CheckCheck className="w-3.5 h-3.5 text-tertiary" />
                                                    ) : (
                                                        <Check className="w-3.5 h-3.5" />
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        {/*<div ref={mensajesEndRef} />// dummy div para hacer scroll al final cuando cambian los mensajes para mostrar el mensaje más reciente*/}
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
