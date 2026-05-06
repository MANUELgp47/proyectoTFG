//Este es le perfil de usuario, donde se muestra su informacion personal, un boton para editar su perfil(aun no funcional) y un boton para ver las actividades creadas por el usuario
import { useEffect, useState} from "react";
import {getPerfilUsuario, getUsuario} from "../services/usuarioService";
import {Link, useParams} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import {getAmistadEntreUsuarios, eliminarAmistad} from '../services/amistadService';
import type {Usuario, Amistad, SolicitudAmistad} from '../types.ts';
import {CrearSolicitud, getSolicitudAmistad} from "../services/solicitudAmistadService";
import {getChatIndividualPorUsuario, crearChatIndividual} from "../services/chatService";
import {getRecuerdosPorUsuario} from "../services/recuerdoService.ts";
//css
import {Calendar, MapPin, MessageSquare, Pencil, UserMinus, UserPlus} from "lucide-react";
import { Users } from "lucide-react"; // añádelo a tu línea de lucide-react
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../components/ui/sheet";
import TopBar from "../components/ui/TopBar.tsx";

//interfaz tipo usuario solo id y nombreUsuario para mostrar en el perfil si el usuario es privado

interface usuarioPerfil {
    idUsuario: number;
    nombreUsuario: string;
}

export default function PerfilUsuario() {
    //idUsuario por parametero
    const {idUsuarios} = useParams<{ idUsuarios: string }>();
    const [usuario, setUsuario] = useState<Usuario | any>(null);
    const [imagen, setImagen] = useState<string | null>(null);
    const [perfil, setPerfil] = useState<usuarioPerfil>(null);
    const [amistad, setAmistad] = useState<Amistad | null>(null);
    const [solicitud, setSolicitud] = useState<SolicitudAmistad | null>(null);
    const {idUsuario} = useAuth();
    const idSesion = idUsuario;
    const [recuerdos, setRecuerdos] = useState<any[]>([]);
    const [perfilPublico, setPerfilPublico] = useState<boolean>(false);
   // const [somosAmigos, setSomosAmigos] = useState<boolean>(false);

   /* useEffect(() => {
        //si no hay sesión, el perfil es privado por defecto
        if (idSesion === null) {
            setPerfilPublico(false);
        }

    }, [ idSesion]);*/

    useEffect(() => {
        const fetchUsuario = async () => {

            try {
              //  if (idSesion !== null) {

                    //si somos amigos
             /*       const amistadData = await getAmistadEntreUsuarios(idSesion, Number(idUsuarios));
                    setAmistad(amistadData);
                    if (amistadData || idSesion === Number(idUsuarios)) {
                        setSomosAmigos(true);
                    } else {
                        setSomosAmigos(false);
                    }*/

                    console.log("Fetch Usuario");
                    const data = await getPerfilUsuario(Number(idUsuarios));


                    setUsuario(data);
                    setImagen(data.foto);

                    //publico o privado
                    if (usuario.idUsuario && !usuario.nombre) {
                        setPerfilPublico(false);
                    } else if (usuario.nombre) {
                        setPerfilPublico(true);
                    }

                    /*  const perfilData = await getPerfilUsuario(Number(idUsuarios));
                      setPerfil(perfilData);
                      console.log("perfil", perfilData);*/
          //      }
            } catch (error) {

                console.error("Error al cargar usuario:", error);

            }
        };

        fetchUsuario();
    }, [idUsuarios, idSesion]); //TODO si falla algo quitar idSesion

    useEffect(() => {
        const fetchAmistad = async () => {
            if (idSesion == null) {
                // si no hay sesión aún, no buscar amistad
                setAmistad(null);
                setSolicitud(null);
                return;
            }

            const fetchedSolicitud = await getSolicitudAmistad(Number(idUsuarios));
            setSolicitud(fetchedSolicitud);
            const fetchedAmistad = await getAmistadEntreUsuarios(idSesion, Number(idUsuarios));
            //  console.log("Amistad entre usuarios", idSesion, idUsuario, fetchedAmistad);
            setAmistad(fetchedAmistad);
           /* console.log("id usuario perfil", idUsuarios, "id sesion", idSesion, "amistad", fetchedAmistad, "solicitud", fetchedSolicitud);
            const recuerdos = await getRecuerdosPorUsuario(Number(idUsuarios));
            console.log("recuerdos", recuerdos);
            setRecuerdos(recuerdos);*/


        };
        fetchAmistad();
    }, [idSesion, idUsuarios]);

    useEffect(() => {
        const fetchRecuerdos = async () => {
            try {
                const recuerdosData = await getRecuerdosPorUsuario(Number(idUsuarios));
                setRecuerdos(recuerdosData);
            } catch (error) {
                console.error("Error al cargar recuerdos:", error);
            }
        };

        fetchRecuerdos();
    }, [idUsuarios]);


    if (!usuario) {
        return <div>Cargando...</div>;
    }

    const handleEliminarAmistad = () => {
        if (!amistad) return;
        eliminarAmistad(usuario.idUsuario);
        alert("Amistad eliminada");
        return;
    }
    const handleEnviarSolicitudAmistad = () => {
        console.log("solicitud" + solicitud)
        CrearSolicitud(usuario.idUsuario);
        alert("Solicitud de amistad enviada");
        return;
    }
    const handleChatear = async () => {
        // Redirige al chat individual con este usuario. Si no existe, pregunta y lo crea.
        try {


            const chatExistente = await getChatIndividualPorUsuario(Number(idUsuarios));

            if (!chatExistente) {
                const confirmar = window.confirm("¿Quieres iniciar un chat con este usuario?");
                if (confirmar) {

                    const nuevoChat = await crearChatIndividual(usuario.idUsuario);


                    alert("Chat creado");
                    // redirigir al chat creado
                    window.location.href = `/chatIndividual/${nuevoChat.idChatIndividual}`;
                }
            } else {
                // redirigir al chat existente
                window.location.href = `/chatIndividual/${chatExistente.idChatIndividual}`;
            }
        } catch (error) {
            console.error('Error al abrir/crear chat:', error);
            alert('No se pudo abrir el chat. Inténtalo de nuevo.');
        }

    }

    const sidebarContent = (
        <div className="space-y-6">
            <TopBar />
            {/* --- Amigos --- */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3
                        className="text-lg font-extrabold text-secondary"
                        style={{ fontFamily: "'Manrope', sans-serif" }}
                    >
                        Amigos
                    </h3>
                </div>

                <div className="space-y-3">
                    {[
                        { nombre: "Ejemplo 1", rol: "Amigo" },
                        { nombre: "Ejemplo 2", rol: "Amigo" },
                        { nombre: "Ejemplo 3", rol: "Amigo" },
                    ].map((amigo, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white font-semibold text-sm">
                                {amigo.nombre.charAt(0)}
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-semibold text-secondary truncate">
                                    {amigo.nombre}
                                </div>
                                <div className="text-xs text-neutral truncate">{amigo.rol}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <Link
                    to={`/amistad/${idUsuarios}`}
                    className="mt-5 block text-center py-2.5 rounded-xl bg-neutral-light text-primary text-sm font-semibold hover:bg-slate-200 transition"
                >
                    Ver todas las amistades
                </Link>
            </div>

            {/* --- Estadísticas --- */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h3
                    className="text-lg font-extrabold text-secondary mb-4"
                    style={{ fontFamily: "'Manrope', sans-serif" }}
                >
                    Estadísticas
                </h3>

                <Link
                    to={`/usuario/${idUsuarios}/actividadesCreadas`}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-light hover:bg-slate-200 transition"
                >
                    <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <div className="text-2xl font-extrabold text-primary leading-none">
                            {recuerdos.length}
                        </div>
                        <div className="text-[11px] font-bold tracking-wider text-neutral uppercase mt-1">
                            Actividades creadas
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FB]">
            <div className="max-w-[1200px] mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                    {/* ============ COLUMNA PRINCIPAL ============ */}

                    <main className="space-y-8">
                        {/* --- Cabecera de perfil --- */}
                        <section className="bg-white rounded-3xl p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start">
                            {/* Avatar */}
                            <div className="w-40 h-40 rounded-full bg-black overflow-hidden shrink-0 ring-4 ring-white shadow-lg">
                                {imagen ? (
                                    <img
                                        src={imagen}
                                        alt={usuario.nombreUsuario}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).style.display = "none";
                                        }}
                                    />
                                ) : null}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1
                                        className="text-4xl font-extrabold text-secondary tracking-tight"
                                        style={{ fontFamily: "'Manrope', sans-serif" }}
                                    >
                                        {usuario.nombre} {usuario.apellidos}
                                    </h1>
                                    <span className="px-3 py-1 rounded-full bg-tertiary text-secondary text-xs font-bold">
                  @{usuario.nombreUsuario}
                </span>
                                </div>

                                {usuario.biografia && (
                                    <p className="mt-4 text-neutral italic text-[15px] leading-relaxed">
                                        "{usuario.biografia}"
                                    </p>
                                )}

                                <div className="mt-3 flex flex-wrap gap-4 text-sm text-neutral">
                                    {usuario.ubicacion && (
                                        <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                                            {usuario.ubicacion}
                  </span>
                                    )}
                                    <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  Desde {new Date(usuario.fechaRegistro).toLocaleDateString()}
                </span>
                                </div>

                                {/* Botones de acción */}
                                <div className="mt-6 flex flex-wrap gap-3">
                                    {/* Yo mismo → Editar perfil */}
                                    {idSesion !== null && idSesion === Number(idUsuarios) && (
                                        <Link to={`/usuario/${idUsuarios}/editar`}>
                                            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-600 transition">
                                                <Pencil className="w-4 h-4" />
                                                Editar perfil
                                            </button>
                                        </Link>
                                    )}

                                    {/* Ya somos amigos → Eliminar + Chatear */}
                                    {amistad && (
                                        <>
                                            <button
                                                onClick={handleChatear}
                                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-600 transition"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                Enviar mensaje
                                            </button>
                                            <button
                                                onClick={handleEliminarAmistad}
                                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-light text-secondary font-semibold text-sm hover:bg-slate-200 transition"
                                            >
                                                <UserMinus className="w-4 h-4" />
                                                Eliminar amistad
                                            </button>
                                        </>
                                    )}

                                    {/* No amigo + no solicitud + no soy yo → Enviar solicitud */}
                                    {!amistad &&
                                        solicitud?.estado !== "pendiente" &&
                                        Number(idSesion) !== Number(idUsuarios) && (
                                            <button
                                                onClick={handleEnviarSolicitudAmistad}
                                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-600 transition"
                                            >
                                                <UserPlus className="w-4 h-4" />
                                                Añadir amigo
                                            </button>
                                        )}

                                    {/* Solicitud pendiente */}
                                    {!amistad && solicitud?.estado === "pendiente" && (
                                        <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-light text-neutral font-semibold text-sm">
                    Solicitud pendiente
                  </span>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* --- Recuerdos --- */}
                        <section>
                            <h2
                                className="text-2xl font-extrabold text-secondary mb-5"
                                style={{ fontFamily: "'Manrope', sans-serif" }}
                            >
                                Recuerdos
                            </h2>


                            {recuerdos.length === 0 || !perfilPublico && !amistad && Number(idSesion) !== Number(idUsuarios)  ? (
                                <div className="bg-white rounded-3xl p-12 text-center text-neutral">{recuerdos.length === 0 ?(" No ha creado ningún recuerdo aún."):("Perfil privado")}

                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {recuerdos.map((recuerdo) => {
                                        // Placeholders para los datos que aún no tienes
                                        const fecha =
                                            recuerdo.fecha ?? "12 Jun 2024";
                                        const descripcion =
                                            recuerdo.descripcion ??
                                            "Descripción de ejemplo del recuerdo. Cuando tengas el campo en el backend, se mostrará aquí y se truncará si es muy largo.";

                                        return (
                                            <Link
                                                key={recuerdo.idRecuerdo}
                                                to={`/Recuerdo/${recuerdo.idRecuerdo}`}
                                                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition flex flex-col"
                                            >
                                                {/* Imagen con fallback negro */}
                                                <div className="relative w-full aspect-[4/3] bg-black overflow-hidden">
                                                    {recuerdo.imagen && (
                                                        <img
                                                            src={recuerdo.imagen}
                                                            alt={recuerdo.titulo}
                                                            className="absolute inset-0 w-full h-full object-cover"
                                                            onError={(e) => {
                                                                (e.currentTarget as HTMLImageElement).style.display = "none";
                                                            }}
                                                        />
                                                    )}
                                                </div>

                                                {/* Contenido */}
                                                <div className="p-5 flex flex-col flex-1">
                                                    <h3
                                                        className="text-lg font-extrabold text-secondary group-hover:text-primary transition"
                                                        style={{ fontFamily: "'Manrope', sans-serif" }}
                                                    >
                                                        {recuerdo.titulo}
                                                    </h3>
                                                    <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral">
                                                        <Calendar className="w-3.5 h-3.5 text-primary" />
                                                        {fecha}
                                                    </div>
                                                    <p className="mt-3 text-sm text-neutral leading-relaxed line-clamp-3">
                                                        {descripcion}
                                                    </p>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </main>

                    {/* ============ COLUMNA DERECHA ============ */}
                    {/* Aside sólo visible en desktop */}

                    <aside className="hidden lg:block">
                        {sidebarContent}
                    </aside>

                    {/* Botón flotante + Sheet sólo visible en móvil/tablet */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <button
                                type="button"
                                className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary-600 transition active:scale-95"
                                aria-label="Ver amigos y estadísticas"
                            >
                                <Users className="w-6 h-6" />
                            </button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="w-[90vw] sm:w-[380px] bg-[#F8F9FB] border-l border-slate-200 overflow-y-auto p-6"
                        >
                            <SheetHeader className="mb-4">
                                <SheetTitle
                                    className="text-xl font-extrabold text-secondary"
                                    style={{ fontFamily: "'Manrope', sans-serif" }}
                                >
                                    Amigos y estadísticas
                                </SheetTitle>
                            </SheetHeader>
                            {sidebarContent}
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </div>
    );}