//la vista de un recuerdo pasado por parametro y la lista de los usuarios que participaron en la actividad a la que pertenece el recuerdo
//TODO sacar participantes de la actividad y listarlos con enlace a su perfil
import {useEffect, useState} from "react";
import {getRecuerdoPorId, eliminarRecuerdos} from "../services/recuerdoService";
import {Link, useParams} from "react-router-dom";
import type {Recuerdo, Usuario, Comentario} from "../types.ts";
import {getParticipacionesPorActividad} from "../services/participacionService";
import {getUsuario, getDatosMinimosUsuario} from "../services/usuarioService";
import {getComentarioByIdRecuerdo, crearComentario, eliminarComentario} from "../services/comentarioService.ts";
import {
    crearLike,
    getLikesByIdRecuerdo,
    usuarioDioLikeRecuerdo,
    getLikesByIdComentario,
    usuarioDioLikeComnetario
} from "../services/likeService.ts";
import {useAuth} from "../context/AuthContext.tsx";

import {Heart, Share2, Users, Trash2, Calendar, Ticket} from "lucide-react";
import TopBar from "../components/ui/TopBar.tsx";

export default function VistaRecuerdo() {
    const {idRecuerdo} = useParams();
    const [recuerdo, setRecuerdo] = useState<Recuerdo | null>(null);
    const [error] = useState("");
    const [participantes, setParticipantes] = useState<Usuario[]>([]);
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    //const [likes, setLikes] = useState<number>(0);
    const [likes, setLikes] = useState<number>(0);
    const [heDadoLike, setHeDadoLike] = useState<boolean | null>(null);
    const [heDadoLikeLoaded, setHeDadoLikeLoaded] = useState<boolean>(false);
    const [creadorMinimo, setcreadorioMinimo] = useState<any>(null);

    //mapa de usuarios
    const [mapaUsuarioMinimo, getmapaUsuarioMinimo] = useState<Record<number, {
        idUsuario: number;
        nombreUsuario: string;
        imagen?: string | null;
    }>>({});


    const [likesComentarios, setLikesComentarios] = useState<{ [idComentario: number]: number }>({});
    const [heDadoLikeComentarios, setHeDadoLikeComentarios] = useState<{ [idComentario: number]: boolean }>({});
    const {rol, idUsuario} = useAuth();


    useEffect(() => {
        const fetchRecuerdo = async () => {
            try {
                if (!idRecuerdo) return; // proteger si falta el parámetro

                const data = await getRecuerdoPorId(Number(idRecuerdo));
                setRecuerdo(data);
                //obtener participantes de la actividad a la que pertenece el recuerdo
                const participantesData = await getParticipacionesPorActividad(data.idActividad);
                //  console.log("Participacion", participantesData);
                const participantesList = await Promise.all(participantesData.map(async (participacion: {
                    idUsuario: number
                }) => {
                    return await getUsuario(participacion.idUsuario) as Usuario;
                }));
                setParticipantes(participantesList);
                //likes
                const likesData = await getLikesByIdRecuerdo(Number(idRecuerdo));
                // Normalizar el resultado a un número: el servicio puede devolver un número o un objeto
                const numeroLikes = typeof likesData === 'number'
                    ? likesData
                    : (likesData && (likesData.numeroLikes ?? likesData.count ?? 0)) || 0;
                setLikes(numeroLikes);

                const heDadoLikeData = await usuarioDioLikeRecuerdo(Number(idRecuerdo));// devuelve true o false


                // Marcar si el usuario ya ha dado like
                const heDadoLikeBool = Boolean(heDadoLikeData);


                setHeDadoLike(heDadoLikeBool);
                setHeDadoLikeLoaded(true);

                // Obtener datos mínimos del creador para mostrar su nombre e inicial en la vista del recuerdo
                if (data.idUsuario) {
                    const creadorData = await getDatosMinimosUsuario(data.idUsuario);
                    setcreadorioMinimo(creadorData);
                }
                console.log("Datos creador", creadorMinimo);

            } catch (err) {
                console.error(err);
            }
        };

        fetchRecuerdo();
    }, [idRecuerdo]);

    //Obtener comentarios
    useEffect(() => {
        const fetchComentarios = async () => {
            try {
                if (!idRecuerdo) return;
                const comentariosData = await getComentarioByIdRecuerdo(Number(idRecuerdo)) as Comentario[];
                // console.log("Comentarios", comentariosData);
                setComentarios(comentariosData);

                // Obtener likes de cada comentario y a los que yo le he dado like
                const likesData: { [idComentario: number]: number } = {};
                const likesDataYo: { [idComentario: number]: boolean } = {};
                await Promise.all(comentariosData.map(async (comentario) => {// para cada comentario obtenemos su número de likes y lo guardamos en un objeto con clave el id del comentario y valor el número de likes
                    const numeroLikes = await getLikesByIdComentario(comentario.idComentario);
                    likesData[comentario.idComentario] = typeof numeroLikes === 'number'
                        ? numeroLikes
                        : (numeroLikes && (numeroLikes.numeroLikes ?? numeroLikes.count ?? 0)) || 0;

                    // Obtener si el usuario ha dado like a este comentario
                    const heDadoLikeData = await usuarioDioLikeComnetario(Number(comentario.idComentario));
                    likesDataYo[comentario.idComentario] = Boolean(heDadoLikeData);


                }));
                setLikesComentarios(likesData);
                setHeDadoLikeComentarios(likesDataYo);


            } catch (err) {
                console.error(err);
            }
        }
        fetchComentarios();
    }, [idRecuerdo]);


    //mira los comentarios y obtiene los datos minimos de cada usuario que ha comentado y lo ordena por numero de idUsuario
    useEffect(() => {
        const fetchUsuariosComentarios = async () => {
            try {
                if (comentarios.length === 0) return;
                const mapa: Record<number, {
                    idUsuario: number;
                    nombreUsuario: string;
                    imagen?: string | null;
                }> = {};
                await Promise.all(comentarios.map(async (comentario) => {
                    if (!mapa[comentario.idUsuario]) {
                        const usuarioData = await getDatosMinimosUsuario(comentario.idUsuario);
                        mapa[comentario.idUsuario] = {
                            idUsuario: comentario.idUsuario,
                            nombreUsuario: usuarioData.nombreUsuario,
                            imagen: usuarioData.imagen
                        };
                    }
                }));
                getmapaUsuarioMinimo(mapa);//ordenado por idUsuario
            } catch (err) {
                console.error(err);
            }
        }
        fetchUsuariosComentarios();
    }, [comentarios]);


    const handleCrearComentario = async (texto: string) => {

        await crearComentario({idRecuerdo: Number(idRecuerdo), mensaje: texto});


        //refrescar comentarios
        const comentariosData = await getComentarioByIdRecuerdo(Number(idRecuerdo)) as Comentario[];
        setComentarios(comentariosData);

    }
    const handleLikeRecuerdo = async () => {

        if (!idRecuerdo) return;

        await crearLike({idRecuerdo: Number(idRecuerdo)});

        //refrescar likes
        const likesData = await getLikesByIdRecuerdo(Number(idRecuerdo));
        const numeroLikes = typeof likesData === 'number'
            ? likesData
            : (likesData && (likesData.numeroLikes ?? likesData.count ?? 0)) || 0;
        setLikes(numeroLikes);
        // Marcar que el usuario ya ha dado like
        setHeDadoLike(true);
        setHeDadoLikeLoaded(true);
    }
    const handleLikeComentario = async (idComentario: number) => {

        await crearLike({idComentario: idComentario});

        //refrescar likes del comentario
        const numeroLikes = await getLikesByIdComentario(idComentario);
        setLikesComentarios(prev => ({
            ...prev,
            [idComentario]: typeof numeroLikes === 'number'
                ? numeroLikes
                : (numeroLikes && (numeroLikes.numeroLikes ?? numeroLikes.count ?? 0)) || 0
        }));

        //recargar si he dado like a este comentario
        const heDadoLikeData = await usuarioDioLikeComnetario(idComentario);
        setHeDadoLikeComentarios(prev => ({
            ...prev,
            [idComentario]: Boolean(heDadoLikeData)
        }));
    }

    const handleEliminaComentario = async (idComentario: number) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar el comentario? Esta acción no se puede deshacer.")) {
            await eliminarComentario(idComentario);

            //refrescar comentarios
            const comentariosData = await getComentarioByIdRecuerdo(Number(idRecuerdo)) as Comentario[];
            setComentarios(comentariosData);
        }
    }

    const handleEliminarRecuerdo = async () => {
        if (!idRecuerdo) return;
        if (window.confirm("¿Estás seguro de que deseas eliminar este recuerdo? Esta acción no se puede deshacer.")) {
            await eliminarRecuerdos(Number(idRecuerdo));
            window.location.href = "/";
        }
    }


    if (error) {
        return <div>{error}</div>;
    }

    if (!recuerdo) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="min-h-screen bg-[#F8F9FB]">
            <div className="max-w-[1200px] mx-auto px-6 py-6">
                <TopBar/>

                <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8">
                    {/* ============ COLUMNA IZQUIERDA ============ */}
                    <section>
                        {/* Badge */}
                        <span
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary text-secondary text-xs font-bold tracking-wider">
            RECUERDO PUBLICADO
          </span>

                        {/* Título */}
                        <h1
                            className="mt-4 text-4xl sm:text-5xl font-extrabold text-secondary tracking-tight leading-tight"
                            style={{fontFamily: "'Manrope', sans-serif"}}
                        >
                            {recuerdo.titulo}
                        </h1>

                        {/* Metadatos */}
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-neutral">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary"/>
                {recuerdo.fechaCreacion
                    ? new Date(recuerdo.fechaCreacion).toLocaleDateString()
                    : "Fecha de ejemplo"}
            </span>
                            {recuerdo.idActividad && (
                                <>
                                    <span>•</span>
                                    <Link
                                        to={`/actividad/${recuerdo.idActividad}`}
                                        className="flex items-center gap-1.5 italic hover:text-primary transition"
                                    >
                                        <Ticket className="w-4 h-4 text-primary"/>
                                        {recuerdo.titulo}
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Botones de acción */}
                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            {/* Like */}
                            <button
                                onClick={handleLikeRecuerdo}
                                disabled={!heDadoLikeLoaded || heDadoLike === true}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-secondary font-semibold text-sm shadow-sm hover:bg-slate-50 transition disabled:opacity-100"
                            >
                                <Heart
                                    className={`w-4 h-4 ${
                                        heDadoLike ? "fill-red-500 text-red-500" : "text-red-500"
                                    }`}
                                />
                                {likes.toLocaleString()}
                            </button>

                            {/* Compartir */}
                            <button
                                onClick={() => navigator.clipboard?.writeText(window.location.href)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-secondary font-semibold text-sm hover:bg-white transition"
                            >
                                <Share2 className="w-4 h-4"/>
                                Compartir
                            </button>

                            {/* Ver participantes (scroll al bloque) */}
                            <a
                                href="#participantes"
                                className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-600 transition"
                            >
                                <Users className="w-4 h-4"/>
                                Ver participantes ({participantes.length})
                            </a>
                        </div>

                        {/* Descripción + creador */}
                        <div className="mt-6 bg-white rounded-3xl p-7 shadow-sm">
                            <p className="text-neutral leading-relaxed whitespace-pre-wrap">
                                {recuerdo.descripcion}
                            </p>

                            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-3">
                                <div
                                    className="w-11 h-11 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-white text-sm font-semibold">
                                    {creadorMinimo?.imagen ? (
                                        <img
                                            src={creadorMinimo?.imagen}
                                            alt={creadorMinimo?.nombreUsuario}
                                            className="w-full h-full object-cover"
                                            onError={(e) =>
                                                ((e.currentTarget as HTMLImageElement).style.display = "none")
                                            }
                                        />
                                    ) : (
                                        (creadorMinimo?.nombreUsuario ?? "U").charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <Link
                                        key={recuerdo.idUsuario}
                                        to={`/usuario/${recuerdo.idUsuario}`}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-secondary text-sm font-medium hover:bg-neutral-light transition"
                                    >
                                    <div className="text-sm font-bold text-secondary">
                                        {creadorMinimo?.nombreUsuario ?? "Creador"}
                                    </div>
                                    </Link>
                                    <div className="text-xs text-neutral">Creador del recuerdo</div>
                                </div>

                                {/* Eliminar recuerdo (admin/mod/dueño) */}
                                {(rol === "admin" || rol === "mod" || idUsuario === recuerdo.idUsuario) && (
                                    <button
                                        onClick={() => handleEliminarRecuerdo()}
                                        className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 text-xs font-semibold hover:bg-red-50 transition"
                                    >
                                        <Trash2 className="w-3.5 h-3.5"/>
                                        Eliminar
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* ============ COLUMNA DERECHA: GALERÍA ============ */}
                    <aside>
                        <div className="flex items-center justify-between mb-4">
                            <h2
                                className="text-xl font-extrabold text-secondary"
                                style={{fontFamily: "'Manrope', sans-serif"}}
                            >
                                Galería de momentos
                            </h2>
                            <span className="text-sm text-neutral">
              {recuerdo.imagenes?.length ?? 0} archivos
            </span>
                        </div>

                        {recuerdo.imagenes && recuerdo.imagenes.length > 0 ? (
                            <div className="space-y-3">
                                {/* Imagen destacada */}
                                <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden">
                                    <img
                                        src={recuerdo.imagenes[0]}
                                        alt="Destacada"
                                        className="absolute inset-0 w-full h-full object-cover"
                                        onError={(e) =>
                                            ((e.currentTarget as HTMLImageElement).style.display = "none")
                                        }
                                    />
                                </div>

                                {/* Grid 2x2 con las siguientes 4 (y +N si hay más) */}
                                {recuerdo.imagenes.length > 1 && (
                                    <div className="grid grid-cols-2 gap-3">
                                        {recuerdo.imagenes.slice(1, 5).map((url, i, arr) => {
                                            const isLast = i === arr.length - 1;
                                            const extra = recuerdo.imagenes!.length - 5;
                                            return (
                                                <div
                                                    key={i}
                                                    className="relative aspect-square bg-black rounded-2xl overflow-hidden"
                                                >
                                                    <img
                                                        src={url}
                                                        alt={`Foto ${i + 2}`}
                                                        className="absolute inset-0 w-full h-full object-cover"
                                                        onError={(e) =>
                                                            ((e.currentTarget as HTMLImageElement).style.display = "none")
                                                        }
                                                    />
                                                    {isLast && extra > 0 && (
                                                        <div
                                                            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-extrabold">
                                                            +{extra}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div
                                className="w-full aspect-video bg-black rounded-2xl flex items-center justify-center text-neutral text-sm">
                                No hay imágenes
                            </div>
                        )}
                    </aside>
                </div>

                {/* ============ PARTICIPANTES ============ */}
                <section id="participantes" className="mt-12">
                    <h2
                        className="text-2xl font-extrabold text-secondary mb-5"
                        style={{fontFamily: "'Manrope', sans-serif"}}
                    >
                        Participantes ({participantes.length})
                    </h2>
                    {participantes.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {participantes.map((p) => (
                                <Link
                                    key={p.idUsuario}
                                    to={`/usuario/${p.idUsuario}`}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-secondary text-sm font-medium hover:bg-neutral-light transition"
                                >
                                    <div
                                        className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                                        {p.imagen ? (
                                            <img
                                                src={p.imagen}
                                                alt={p.nombreUsuario}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-white text-xs font-bold">
      {p.nombreUsuario.charAt(0).toUpperCase()}
    </span>
                                        )}
                                    </div>
                                    {p.nombreUsuario}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-neutral">No hay participantes en este recuerdo.</p>
                    )}
                </section>

                {/* ============ COMENTARIOS ============ */}
                <section className="mt-12">
                    <h2
                        className="text-2xl font-extrabold text-secondary mb-5"
                        style={{fontFamily: "'Manrope', sans-serif"}}
                    >
                        Comentarios <span className="text-neutral font-normal">({comentarios.length})</span>
                    </h2>

                    {/* Crear comentario */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const texto = formData.get("texto") as string;
                            handleCrearComentario(texto);
                            e.currentTarget.reset();
                        }}
                        className="bg-white rounded-3xl p-5 shadow-sm"
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {(idUsuario ?? "U").toString().charAt(0).toUpperCase()}
                            </div>
                            <textarea
                                name="texto"
                                required
                                placeholder="Escribe un comentario..."
                                className="flex-1 min-h-[80px] resize-y bg-neutral-light rounded-xl px-4 py-3 text-sm text-secondary placeholder-neutral outline-none focus:ring-2 focus:ring-primary-100"
                            />
                        </div>
                        <div className="mt-3 flex justify-end">
                            <button
                                type="submit"
                                className="px-6 py-2.5 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-600 transition"
                            >
                                Publicar
                            </button>
                        </div>
                    </form>

                    {/* Lista de comentarios */}
                    <div className="mt-6 space-y-4">
                        {comentarios.length === 0 ? (
                            <p className="text-neutral">No hay comentarios aún. ¡Sé el primero!</p>
                        ) : (
                            comentarios.map((c) => (
                                <div
                                    key={c.idComentario}
                                    className="flex items-start gap-3"
                                >
                                    <div className="w-9 h-9 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-white text-xs font-bold shrink-0">
                                        {mapaUsuarioMinimo[c.idUsuario]?.imagen ? (
                                            <img
                                                src={mapaUsuarioMinimo[c.idUsuario]!.imagen!}
                                                alt={mapaUsuarioMinimo[c.idUsuario]?.nombreUsuario ?? `Usuario ${c.idUsuario}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                                            />
                                        ) : (
                                            <span className="text-white text-xs font-bold">
      {(mapaUsuarioMinimo[c.idUsuario]?.nombreUsuario ?? c.idUsuario.toString()).charAt(0).toUpperCase()}
    </span>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                                            <div className="flex items-center justify-between gap-4">
                                                <Link
                                                    to={`/usuario/${c.idUsuario}`}
                                                    className="text-sm font-bold text-secondary hover:underline"
                                                >
                                                    {mapaUsuarioMinimo[c.idUsuario]?.nombreUsuario ?? `Usuario ${c.idUsuario}`}
                                                </Link>
                                                <span className="text-xs text-neutral">
        {c.fechaCreacion ? new Date(c.fechaCreacion).toLocaleDateString() : "Hace un rato"}
      </span>
                                            </div>
                                            <p className="mt-1 text-sm text-secondary leading-relaxed">
                                                {c.mensaje}
                                            </p>
                                        </div>

                                        <div className="mt-2 flex items-center gap-4 pl-2">
                                            <button
                                                onClick={() => handleLikeComentario(c.idComentario)}
                                                disabled={heDadoLikeComentarios[c.idComentario] === true}
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral hover:text-red-500 transition"
                                            >
                                                <Heart
                                                    className={`w-3.5 h-3.5 ${
                                                        heDadoLikeComentarios[c.idComentario]
                                                            ? "fill-red-500 text-red-500"
                                                            : ""
                                                    }`}
                                                />
                                                {likesComentarios[c.idComentario] ?? 0}
                                            </button>

                                            {(rol === "admin" || rol === "mod") && (
                                                <button
                                                    onClick={() => handleEliminaComentario(c.idComentario)}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600 transition"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5"/>
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}