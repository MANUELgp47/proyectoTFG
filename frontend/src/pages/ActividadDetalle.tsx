import  {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {getActividadPorId, eliminarActividad} from "../services/actividadService";
import {
    eliminarParticipacion,
    getNumeroParticipantes,
    getParticipacionPorId,
    participarEnActividad
} from "../services/participacionService";
import {getChatActividad} from "../services/chatService";
import {useAuth} from "../context/AuthContext.tsx";
import type {Actividad} from "../types.ts";
import {
    ArrowLeft, Bell,
    Clock,
    Edit3,
    Eye,
    FileText, LogIn, LogOut,
    MapPin,
    MessageCircle,
    Share2,
    Trash2, User,
    Users,
    XCircle,
    Zap
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../components/ui/dropdown-menu.tsx";


//estilo



// Tipos locales mínimos para evitar `any`


interface Participacion {
    esCreador?: boolean;
    aceptada?: boolean;
}

export function ActividadDetalle() {
    const {id} = useParams();
    const [actividad, setActividad] = useState<Actividad | null>(null);
    const [loading, setLoading] = useState(true);
    const [numeroParticipantes, setNumeroParticipantes] = useState(0);
    const [miParticipacion, setParticipacion] = useState<Participacion | null>(null);
    const [idChatActividad, setIdChatActividad] = useState<number | null>(null);
    const {idUsuario, rol, isAuthenticated, logout} = useAuth();
    const idSesion = Number(idUsuario);
    //Es admin de la actividad?
    const [isAdminActividad, setIsAdminActividad] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("Cargando detalles de la actividad con id:", id);
                if (id) {
                    const data = await getActividadPorId(Number(id));
                    setActividad(data);

                    const num = await getNumeroParticipantes(Number(id));
                    setNumeroParticipantes(num);

                    const miParticipacion = await getParticipacionPorId(Number(id));
                    setParticipacion(miParticipacion);

                    //si participo en la actividad, cargar el chat de la actividad para marcar los mensajes como leídos
                    if (miParticipacion && miParticipacion.aceptada) {
                        //   console.log("Cargando chat de la actividad para marcar mensajes como leídos, miParticipacion", miParticipacion);
                        const chat = await getChatActividad(Number(id));

                        // Comprobamos que chat no sea false ni un booleano antes de acceder a sus propiedades
                        if (chat && typeof chat !== 'boolean' && 'idChatActividad' in chat) {
                            setIdChatActividad(chat.idChatActividad);
                        } else {
                            // Si no hay chat, dejamos idChatActividad en null y avisamos en consola (no lanzar excepción)
                            console.warn('No se encontró chat de actividad para id:', id);
                            setIdChatActividad(null);
                        }


                        // console.log(chat.idChatActividad);
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

    if (loading) return <p>Cargando...</p>;
    if (!actividad) return <p>Actividad no encontrada.</p>;

    const participantesPublica = actividad.publica ? "Esta actividad es pública." : `Participantes: ${numeroParticipantes} / ${actividad.participantesmax}`;
    const handleParticipar = async () => {
        try {
            // llama a tu endpoint participar
            await participarEnActividad(actividad.idActividad);
            console.log("Participar");
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
            console.log("Dejar participar");
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



    return (
        <div  className="min-h-screen bg-[#EEF2FB]"
              style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>

            <div className="max-w-[1200px] mx-auto px-6 py-6 space-y-6">

            {/* ========== HEADER SUPERIOR (Tus componentes) ========== */}
            <header className="sticky top-0 z-[40] w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 no-underline group">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold italic">K</div>
                    <span className="text-xl font-black text-secondary italic group-hover:text-primary transition">Kinetic</span>
                </Link>

                <div className="flex items-center gap-4">
                    {/* Campanita */}
                    {isAuthenticated && (
                        <Link to="/notificaciones">
                            <button className="relative w-11 h-11 rounded-full bg-white flex items-center justify-center text-neutral hover:text-secondary transition shadow-sm border border-slate-100">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-tertiary" />
                            </button>
                        </Link>
                    )}

                    {/* Usuario / Login */}
                    {!isAuthenticated ? (
                        <Link to="/login">
                            <button className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary-600 transition shadow-lg shadow-primary/20">
                                <LogIn className="w-4 h-4" /> Log in
                            </button>
                        </Link>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-600 transition shadow-lg shadow-primary/20">
                                    <User className="w-5 h-5" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2">
                                {idUsuario != null && (
                                    <DropdownMenuItem asChild className="rounded-xl">
                                        <Link to={`/usuario/${idUsuario}`}>Mi perfil</Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem asChild className="rounded-xl">
                                    <Link to="/misActividades">Mis actividades</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => logout()} className="text-red-600 focus:text-red-700 rounded-xl">
                                    <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </header>
            {/* ========== CABECERA / HERO ========== */}
            <div className="relative h-[400px] w-full bg-black overflow-hidden md:rounded-b-[3.5rem] shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />


                {/* Botones superiores */}
                <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-center">
                    <Link to="/" className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex gap-2">
                        <button className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>


                {/* Título e Imágenes (Carousel Simplificado) */}
                <div className="absolute bottom-12 left-6 right-6 z-20 max-w-7xl mx-auto">
                    <div className="flex gap-2 mb-4">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${actividad.estado === 'activa' ? 'bg-tertiary text-secondary' : 'bg-red-500 text-white'}`}>
                            {actividad.estado}
                        </span>
                        <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                            Public Activity
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white font-heading leading-tight max-w-4xl tracking-tighter">
                        {actividad.titulo}
                    </h1>
                </div>

                {/* Renderizado de la primera imagen de fondo si existe */}
                {actividad.imagenes && actividad.imagenes.length > 0 && (
                    <img
                        src={actividad.imagenes[0]}
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                        alt="Header"
                    />
                )}
            </div>

            <main className="max-w-7xl mx-auto px-6 -mt-12 relative z-30">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* COLUMNA IZQUIERDA */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Info de Creador y Tags */}
                        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-neutral-light flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-white font-bold text-xl">
                                    {actividad.creador?.nombre?.charAt(0) || "U"}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-neutral uppercase tracking-widest">Organized by</p>
                                    <p className="text-secondary font-bold text-lg">{actividad.creador?.nombre || "Usuario"}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {/* Tags de ejemplo o reales */}
                                <span className="px-4 py-2 bg-slate-100 text-neutral text-xs font-bold rounded-xl">#Activity</span>
                                <span className="px-4 py-2 bg-slate-100 text-neutral text-xs font-bold rounded-xl">#Community</span>
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-neutral-light">
                            <div className="flex items-center gap-3 mb-6 text-primary">
                                <FileText size={24} />
                                <h2 className="text-2xl font-black text-secondary font-heading">About the Activity</h2>
                            </div>
                            <p className="text-neutral leading-relaxed text-lg whitespace-pre-line">
                                {actividad.descripcion}
                            </p>
                        </div>

                        {/* Fechas y Ubicación */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-neutral-light">
                                <div className="flex items-center gap-3 mb-4 text-primary">
                                    <Clock size={20} />
                                    <h3 className="font-bold text-secondary">Date & Time</h3>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-secondary">Start: <span className="text-neutral font-medium">{new Date(actividad.fechaInicio).toLocaleString()}</span></p>
                                    <p className="text-sm font-bold text-secondary">End: <span className="text-neutral font-medium">{new Date(actividad.fechaFin).toLocaleString()}</span></p>
                                </div>
                            </div>

                            <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-neutral-light">
                                <div className="flex items-center gap-3 mb-4 text-primary">
                                    <MapPin size={20} />
                                    <h3 className="font-bold text-secondary">Localización</h3>
                                </div>
                                <p className="text-sm font-bold text-secondary">{actividad.ubicacion}</p>
                            </div>
                        </div>
                    </div>




                    {/* COLUMNA DERECHA (Panel de Control/Acciones) */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-neutral-light sticky top-10">

                            {/* Status de Participantes */}
                            <div className="mb-8 space-y-4">
                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                    <div className="flex items-center gap-2 text-xs font-bold text-neutral">
                                        <Users size={16} className="text-primary"/> Capacity
                                    </div>
                                    <span className="text-sm font-black text-secondary">
                                        {actividad.participantesmax === 0 ? "Sin limites" : `${numeroParticipantes} / ${actividad.participantesmax}`}
                                    </span>
                                </div>
                                <p className="text-[10px] text-center text-neutral font-bold px-2">{participantesPublica}</p>
                            </div>

                            {/* ========== LÓGICA DE BOTONES ========== */}
                            <div className="space-y-3">
                                {miParticipacion ? (
                                    <>
                                        {/* Botón Chat (Si está aceptado) */}
                                        {miParticipacion.aceptada && (
                                            <button
                                                onClick={() => window.location.href = `/ChatActividad/${idChatActividad}`}
                                                className="w-full py-4 bg-tertiary text-secondary rounded-2xl font-black flex items-center justify-center gap-2 hover:brightness-95 transition shadow-lg shadow-tertiary/20"
                                            >
                                                <MessageCircle size={20} /> Activity Chat
                                            </button>
                                        )}

                                        {/* Botón Editar (Admin de la actividad) */}
                                        {isAdminActividad && actividad.estado === 'activa' && (
                                            <button
                                                onClick={() => window.location.href = `/ActualizarActividad/${actividad.idActividad}`}
                                                className="w-full py-4 bg-primary text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-primary-600 transition shadow-lg shadow-primary/20"
                                            >
                                                <Edit3 size={20} /> Edit Activity
                                            </button>
                                        )}

                                        {/* Botón Dejar de Participar */}
                                        {miParticipacion.aceptada && actividad.estado === 'activa' && (
                                            <button
                                                onClick={handleDejarParticipar}
                                                className="w-full py-4 bg-white border-2 border-red-100 text-red-500 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-red-50 transition"
                                            >
                                                <XCircle size={20} /> Leave Activity
                                            </button>
                                        )}

                                        {/* Mensaje Pendiente */}
                                        {!miParticipacion.aceptada && (
                                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-center">
                                                <p className="text-xs font-bold text-amber-700 uppercase tracking-tighter">Status: Pending Approval</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    /* Botón Participar o Sin Plazas */
                                    (Number(actividad.participantesmax) > numeroParticipantes || Number(actividad.participantesmax) === 0) ? (
                                        <button
                                            onClick={handleParticipar}
                                            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg shadow-lg shadow-primary/30 hover:bg-primary-600 transition flex items-center justify-center gap-2"
                                        >
                                            Join Now <Zap size={20} fill="currentColor"/>
                                        </button>
                                    ) : (
                                        <div className="p-4 bg-slate-100 rounded-2xl text-center">
                                            <p className="text-sm font-bold text-neutral">No spots available</p>
                                        </div>
                                    )
                                )}

                                {/* Ver Participantes (Siempre visible) */}
                                <button
                                    onClick={() => window.location.href = `/participantes/${id}`}
                                    className="w-full py-4 text-secondary font-black text-sm flex items-center justify-center gap-2 hover:bg-slate-50 rounded-2xl transition"
                                >
                                    <Eye size={18} /> Participantes
                                </button>
                            </div>

                            {/* ========== BORRADO MODERACIÓN ========== */}
                            {(rol === 'admin' || rol === 'mod') && (
                                <div className="mt-8 pt-6 border-t border-dashed border-neutral-light space-y-2">
                                    <p className="text-[10px] font-black text-neutral text-center uppercase mb-4 tracking-widest">Admin Tools</p>
                                    <button
                                        onClick={handleEliminarActividad}
                                        className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-700 transition"
                                    >
                                        <Trash2 size={16} /> Delete Activity (Staff)
                                    </button>
                                    {rol === 'admin' && (
                                        <button
                                            onClick={() => window.location.href = `/ActualizarActividad/${actividad.idActividad}`}
                                            className="w-full py-3 border border-primary text-primary rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary-50 transition"
                                        >
                                            <Edit3 size={16} /> Forced Edit
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            </div>
        </div>
    );
}