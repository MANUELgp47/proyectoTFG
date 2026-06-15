import {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {getActividadPorId, eliminarActividad} from "../services/actividadService";
import {getTagsActividad} from "../services/tagService";
import {
    eliminarParticipacion,
    getNumeroParticipantes,
    getParticipacionPorId,
    participarEnActividad
} from "../services/participacionService";
import {getChatActividad} from "../services/chatService";
import {useAuth} from "../context/AuthContext.tsx";
import type {Actividad} from "../types.ts";
import {getDatosMinimosUsuario} from "../services/usuarioService.ts";
import type {Tag} from "../types.ts";
import {
    Calendar,
    Clock,

    Eye,
    Globe, LogOut,
    MapPin,
    MessageCircle, Pencil,

    Trash2,
    Users,
    Zap,
    Lock, ShieldBan
} from "lucide-react";

import TopBar from "../components/ui/TopBar.tsx";
import {crearDenuncia} from "@/services/notificacionService.ts";


//estilo


// Tipos locales mínimos para evitar `any`


interface Participacion {
    esCreador?: boolean;
    aceptada?: boolean;
}
interface UsuarioMinimo {
    imagen?: string;
    nombreUsuario?: string;
}

export function ActividadDetalle() {
    const {id} = useParams();
    const [actividad, setActividad] = useState<Actividad | null>(null);
    const [loading, setLoading] = useState(true);
    const [numeroParticipantes, setNumeroParticipantes] = useState(0);
    const [miParticipacion, setParticipacion] = useState<Participacion | null>(null);
    const [idChatActividad, setIdChatActividad] = useState<number | null>(null);
    const {idUsuario, rol,} = useAuth();
    const idSesion = Number(idUsuario);
    //Es admin de la actividad?
    const [isAdminActividad, setIsAdminActividad] = useState(false);
    const [usuarioMinimo, setUsuarioMinimo] = useState<UsuarioMinimo | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [imagenTag, setImagenTag] = useState<string>("");


    useEffect(() => {
        const fetchData = async () => {
            try {

                if (id) {
                    const data = await getActividadPorId(Number(id));
                    setActividad(data);

                    const num = await getNumeroParticipantes(Number(id));
                    setNumeroParticipantes(num);

                    const miParticipacion = await getParticipacionPorId(Number(id));
                    setParticipacion(miParticipacion);

                    //si participo en la actividad, cargar el chat de la actividad para marcar los mensajes como leídos
                    if (miParticipacion && miParticipacion.aceptada) {

                        const chat = await getChatActividad(Number(id));

                        // Comprobamos que chat no sea false ni un booleano antes de acceder a sus propiedades
                        if (chat && typeof chat !== 'boolean' && 'idChatActividad' in chat) {
                            setIdChatActividad(chat.idChatActividad);
                        } else {
                            // Si no hay chat, dejamos idChatActividad en null y avisamos en consola (no lanzar excepción)
                            console.warn('No se encontró chat de actividad para id:', id);
                            setIdChatActividad(null);
                        }


                    }

                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    //Comprobar si el usuario es el creador de la actividad o admin para mostrar opciones de edición/borrado
    useEffect(() => {

        if (actividad?.idCreador === idSesion) {
            setIsAdminActividad(true);
        }

        //busca el idSesion en la lista Actividad.admins para ver si es admin de la actividad
        if (actividad?.admins && actividad.admins.includes(idSesion)) {
            setIsAdminActividad(true);
        }

    }, [actividad, idSesion, rol]);

    //cargar los tags de la actividad
    useEffect(() => {
        const fetchTags = async () => {
            if (actividad) {
                try {
                    const tags = await getTagsActividad(actividad.idActividad);
                    setImagenTag(tags[0]?.imagen ?? ""); // Si el primer tag tiene imagen, la usamos; si no, dejamos vacío
                    setTags(tags.map((tag: Tag) => tag.nombre));

                } catch (error) {
                    console.error("Error al cargar tags de la actividad:", error);
                }
            }
        }

        fetchTags();
    }, [actividad]);


    useEffect(() => {
        const fetchUsuariosMinimosActividades = async () => {

            if (actividad?.idCreador) {
                try {
                    const usuario = await getDatosMinimosUsuario(actividad.idCreador);
                    setUsuarioMinimo(usuario);
                } catch (error) {
                    console.error("Error al cargar datos mínimos del usuario:", error);
                }
            }


        };

        fetchUsuariosMinimosActividades();
    }, [actividad]);


    if (loading) return <p>Cargando...</p>;
    if (!actividad) return <p>Actividad no encontrada.</p>;

    // const participantesPublica = actividad.publica ? "Esta actividad es pública." : `Participantes: ${numeroParticipantes} / ${actividad.participantesmax}`;

    const handleParticipar = async () => {
        try {
            // llama a tu endpoint participar
            await participarEnActividad(actividad.idActividad);

            // Recargar la página para actualizar el estado de participación
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDejarParticipar = async () => {
        try {
            // llama a tu endpoint dejar participar

            if (idSesion == null) {
                console.error("No se pudo obtener el ID de sesión del usuario.");
                return;
            }
            if (actividad.idActividad == null) {
                console.error("No se pudo obtener el ID de la actividad.");
                return;
            }
            if (actividad.idCreador == idSesion) {
                console.error("El creador de la actividad no puede dejar de participar.");
                return;
            }

            eliminarParticipacion(idSesion, actividad.idActividad);

            window.location.reload();

        } catch (error) {
            console.error(error);
        }
    };

    const handleEliminarActividad = () => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta actividad? Esta acción no se puede deshacer.")) {
            eliminarActividad(actividad.idActividad);
            // Redirigir a la página principal o a otra página después de eliminar
            window.location.href = "/";
        }
    };

    const handleDenunciaActividad = async () => {
        const mensaje = prompt("Por favor, proporciona una razón para denunciar esta actividad:");
        if (mensaje) {
            await crearDenuncia(idUsuario!, "denuncia_actividad", Number(id), mensaje);
            alert("Gracias por tu denuncia. Nuestro equipo revisará la actividad.");
        }
    }

    const getFirstImage = (imagenes?: string | string[] | null): string | null => {
        if (!imagenes) return null;
        if (Array.isArray(imagenes)) {
            for (const im of imagenes) {
                if (typeof im === "string" && im.trim() !== "") return im;
            }
            return null;
        }
        return typeof imagenes === "string" && imagenes.trim() !== "" ? imagenes : null;
    };

    const heroImg: string | null = getFirstImage(actividad.imagenes);
    const hasHero = Boolean(heroImg || imagenTag);
    const fechaInicio = new Date(actividad.fechaInicio);
    const fechaFin = new Date(actividad.fechaFin);
    const cupoMax = Number(actividad.participantesmax);
    const sinCupo = cupoMax === 0;
    const hayPlazas = sinCupo || cupoMax > numeroParticipantes;
    const esPublica = actividad.publica ?? true; // adapta si tu campo se llama distinto

    return (
        <div className="min-h-screen bg-[#F8F9FB]">
            <div className="max-w-[1200px] mx-auto px-6 py-6">
                <TopBar/>

                {/* ============ HERO ============ */}
                <div
                    className={`relative w-full ${hasHero ? 'aspect-[16/7]' : 'aspect-[4/1]'} rounded-3xl overflow-hidden bg-blue-100 shadow-lg`}
                >
                    {hasHero ? (
                        <>
                            {heroImg ? (
                                <img
                                    src={heroImg}
                                    alt={actividad.titulo}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                                />
                            ) : imagenTag ? (
                                <img
                                    src={imagenTag}
                                    alt={actividad.titulo}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                                />
                            ) : null}
                        </>
                    ) : null}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                    {/* Badges (escritorio dentro del hero) */}
                    <div className="absolute top-6 left-6 flex flex-wrap gap-2 z-30 hidden sm:flex">
    <span
        className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${
            actividad.estado === "activa" ? "bg-tertiary text-secondary" : "bg-white/20 backdrop-blur text-white"
        }`}
    >
        {(actividad.estado ?? "activa").toUpperCase()}{/*  */}
    </span>
                        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs font-bold tracking-wider">
        {esPublica ? "ACTIVIDAD PÚBLICA" : "ACTIVIDAD PRIVADA"}
    </span>
                    </div>
                    {/* Título */}
                    <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 z-10 max-h-[6rem] sm:max-h-none overflow-hidden">
                        <h1
                            className="text-white text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] drop-shadow-lg"
                            style={{ fontFamily: "'Manrope', sans-serif" }}
                        >
                            {actividad.titulo}
                        </h1>
                    </div>

                </div>

                {/* Badges para móvil: debajo del hero, solo visibles en móvil */}
                <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${
                            actividad.estado === "activa"
                                ? "bg-tertiary text-secondary"
                                : "bg-neutral-light text-secondary"
                        }`}
                    >
                        {(actividad.estado ?? "ACTIVA").toUpperCase()}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-neutral-light text-secondary text-xs font-bold tracking-wider">
                        {esPublica ? "ACTIVIDAD PÚBLICA" : "ACTIVIDAD PRIVADA"}
                    </span>
                </div>

                {/* ============ CUERPO ============ */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
                    {/* ----- COLUMNA IZQUIERDA ----- */}
                    <div className="space-y-6">
                        {/* Creador + tags */}
                        <div
                            className="bg-white rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                            <Link
                                to={
                                    actividad.idCreador
                                        ? `/usuario/${actividad.idCreador}`
                                        : "#"
                                }
                                className="flex items-center gap-3 hover:opacity-80 transition"
                            >
                                <div
                                    className="w-12 h-12 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-white font-semibold">
                                    {usuarioMinimo?.imagen ? (
                                        <img
                                            src={usuarioMinimo?.imagen}
                                            alt={usuarioMinimo?.nombreUsuario}
                                            className="w-full h-full object-cover"
                                            onError={(e) =>
                                                ((e.currentTarget as HTMLImageElement).style.display =
                                                    "none")
                                            }
                                        />
                                    ) : (
                                        (usuarioMinimo?.nombreUsuario ?? "U").charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <div className="text-xs text-neutral">Creado por</div>
                                    <div className="font-bold text-secondary">
                                        {usuarioMinimo?.nombreUsuario ?? "Creador"}
                                    </div>
                                </div>
                            </Link>

                            {tags && tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag: string) => (
                                        <span

                                            key={tag}
                                            className="px-3 py-1 rounded-full bg-neutral-light text-secondary text-xs font-semibold"
                                        >
                    #{tag}
                  </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sobre la actividad */}
                        <div className="bg-white rounded-3xl p-7 shadow-sm">
                            <h2
                                className="text-xl font-extrabold text-secondary mb-4 flex items-center gap-2"
                                style={{fontFamily: "'Manrope', sans-serif"}}
                            >
                                <span className="w-1 h-6 bg-primary rounded-full"/>
                                Sobre la actividad
                            </h2>
                            <p className="text-neutral leading-relaxed whitespace-pre-wrap">
                                {actividad.descripcion}
                            </p>
                        </div>

                        {/* Fecha + Ubicación */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-primary-50 rounded-3xl p-6">
                                <Calendar className="w-6 h-6 text-primary"/>
                                <h3
                                    className="mt-3 font-extrabold text-secondary"
                                    style={{fontFamily: "'Manrope', sans-serif"}}
                                >
                                    Fecha y hora
                                </h3>
                                <div className="mt-3 space-y-2 text-sm">
                                    <div>
                                        <div className="text-[10px] font-bold tracking-wider text-neutral uppercase">
                                            Inicio
                                        </div>
                                        <div className="text-secondary font-semibold">
                                            {fechaInicio.toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold tracking-wider text-neutral uppercase">
                                            Fin
                                        </div>
                                        <div className="text-secondary font-semibold">
                                            {fechaFin.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 shadow-sm">
                                <MapPin className="w-6 h-6 text-primary"/>
                                <h3
                                    className="mt-3 font-extrabold text-secondary"
                                    style={{fontFamily: "'Manrope', sans-serif"}}
                                >
                                    Ubicación
                                </h3>
                                <p className="mt-3 text-secondary font-semibold">
                                    {actividad.ubicacion}
                                </p>
                            </div>
                        </div>

                        {/* Galería extra (si hay más de 1 imagen) */}
                        {actividad.imagenes && actividad.imagenes.length > 1 && (
                            <div>
                                <h2
                                    className="text-xl font-extrabold text-secondary mb-4"
                                    style={{fontFamily: "'Manrope', sans-serif"}}
                                >
                                    Galería
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {actividad.imagenes.slice(1).map((url: string, i: number) => (
                                        <div
                                            key={i}
                                            className="relative aspect-square bg-black rounded-2xl overflow-hidden"
                                        >
                                            <img
                                                src={url}
                                                alt={`Imagen ${i + 2}`}
                                                className="absolute inset-0 w-full h-full object-cover"
                                                onError={(e) =>
                                                    ((e.currentTarget as HTMLImageElement).style.display =
                                                        "none")
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ----- COLUMNA DERECHA ----- */}
                    <aside className="space-y-3">
                        {/* Capacidad */}
                        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-primary"/>
                                <span className="font-semibold text-secondary text-sm">
                Capacidad
              </span>
                            </div>
                            <span className="text-secondary font-bold text-sm">
              {sinCupo
                  ? "Sin límite"
                  : `${numeroParticipantes}/${cupoMax} participantes`}
            </span>
                        </div>

                        {/* Privacidad */}
                        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {esPublica ? (
                                    <Globe className="w-5 h-5 text-primary"/>
                                ) : (
                                    <Lock className="w-5 h-5 text-primary"/>
                                )}
                                <span className="font-semibold text-secondary text-sm">
                Privacidad
              </span>
                            </div>
                            <span className="text-secondary font-bold text-sm">
              {esPublica ? "Pública" : "Privada"}
            </span>
                        </div>

                        {/* CTA principal */}
                        <div className="pt-2 space-y-2">
                            {miParticipacion ? (
                                <>
                                    {/* Editar (admin de actividad) */}
                                    {isAdminActividad && actividad.estado === "activa" && (
                                        <Link to={`/ActualizarActividad/${actividad.idActividad}`}>
                                            <button
                                                className="w-full py-3.5 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary-600 transition flex items-center justify-center gap-2">
                                                <Pencil className="w-4 h-4"/>
                                                Editar actividad
                                            </button>
                                        </Link>
                                    )}

                                    {/* Pendiente */}
                                    {!miParticipacion.aceptada && (
                                        <div
                                            className="w-full py-3.5 rounded-full bg-neutral-light text-neutral font-semibold text-sm text-center flex items-center justify-center gap-2">
                                            <Clock className="w-4 h-4"/>
                                            Participación pendiente
                                        </div>
                                    )}

                                    {/* Dejar de participar */}
                                    {miParticipacion.aceptada && actividad.estado === "activa" && actividad.idCreador !== idSesion && (
                                        <button
                                            onClick={handleDejarParticipar}
                                            className="w-full py-3.5 rounded-full bg-white text-red-600 border border-red-200 font-bold text-sm hover:bg-red-50 transition flex items-center justify-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4"/>
                                            Dejar de participar
                                        </button>
                                    )}

                                    {/* Ir al chat */}
                                    {miParticipacion.aceptada && (
                                        <Link to={`/ChatActividad/${idChatActividad}`}>
                                            <button
                                                className="w-full py-3.5 rounded-full bg-secondary text-white font-bold text-sm hover:opacity-90 transition flex items-center justify-center gap-2">
                                                <MessageCircle className="w-4 h-4"/>
                                                Chat de la actividad
                                            </button>
                                        </Link>
                                    )}
                                </>
                            ) : hayPlazas && actividad.estado === 'activa' ? (
                                <button
                                    onClick={handleParticipar}
                                    className="w-full py-4 rounded-full bg-primary text-white font-bold text-base hover:bg-primary-600 transition flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                >
                                    Unirme a la actividad
                                    <Zap className="w-4 h-4 fill-white"/>
                                </button>
                            ) : actividad.estado === 'activa' && (
                                <div
                                    className="w-full py-3.5 rounded-full bg-neutral-light text-neutral font-semibold text-sm text-center">
                                    No hay plazas disponibles
                                </div>
                            )}


                            {/* Ver participantes */}
                            <Link to={`/participantes/${id}`}>
                                <button
                                    className="w-full py-3 rounded-full bg-white text-primary border border-slate-200 font-semibold text-sm hover:bg-neutral-light transition flex items-center justify-center gap-2">
                                    <Eye className="w-4 h-4"/>
                                    Ver participantes
                                </button>
                            </Link>

                            {/*no soy admin ni mod*/}
                            {rol !== "admin" && rol !== "mod" && (
                                <div>
                                    <button
                                        onClick={() => handleDenunciaActividad()}
                                        className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 text-xs font-semibold hover:bg-red-50 transition"
                                    >
                                        <ShieldBan className="w-3.5 h-3.5"/>
                                        Denunciar
                                    </button>
                                </div>
                            )}

                        </div>


                        {/* Acciones de moderación */}
                        {(rol === "admin" || rol === "mod") && (
                            <div className="pt-6 mt-6 border-t border-slate-200 space-y-2">
                                <div className="text-[10px] font-bold tracking-wider text-neutral uppercase mb-2">
                                    Moderación
                                </div>
                                {rol === "admin" && (
                                    <Link to={`/ActualizarActividad/${actividad.idActividad}`}>
                                        <button
                                            className="w-full py-2.5 rounded-xl bg-white text-primary border border-slate-200 font-semibold text-xs hover:bg-neutral-light transition flex items-center justify-center gap-2">
                                            <Pencil className="w-3.5 h-3.5"/>
                                            Editar (admin)
                                        </button>
                                    </Link>
                                )}
                                <button
                                    onClick={handleEliminarActividad}
                                    className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 font-semibold text-xs hover:bg-red-100 transition flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-3.5 h-3.5"/>
                                    Eliminar actividad
                                </button>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
}