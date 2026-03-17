//la vista de un recuerdo pasado por parametro y la lista de los usuarios que participaron en la actividad a la que pertenece el recuerdo
//TODO sacar participantes de la actividad y listarlos con enlace a su perfil
import {useEffect, useState} from "react";
import {getRecuerdoPorId} from "../services/recuerdoService";
import {useParams} from "react-router-dom";
import type {Recuerdo, Usuario, Comentario} from "../types.ts";
import {getParticipacionesPorActividad} from "../services/participacionService";
import {getUsuario} from "../services/usuarioService";
import {getComentarioByIdRecuerdo, crearComentario} from "../services/comentarioService.ts";
import {crearLike, getLikesByIdRecuerdo, usuarioDioLikeRecuerdo} from "../services/likeService.ts";


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


    useEffect(() => {
        const fetchRecuerdo = async () => {
            try {
                if (!idRecuerdo) return; // proteger si falta el parámetro

                const data = await getRecuerdoPorId(Number(idRecuerdo));
                setRecuerdo(data);
                //obtener participantes de la actividad a la que pertenece el recuerdo
                const participantesData = await getParticipacionesPorActividad(data.idActividad);
                //  console.log("Participacion", participantesData);
                const participantesList = await Promise.all(participantesData.map(async (participacion: { idUsuario: number }) => {
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

                const heDadoLikeData = await usuarioDioLikeRecuerdo(Number(idRecuerdo));
                // Normalizar la respuesta pero no convertir valores ausentes en false.
                let heDadoLikeBool: boolean | null = null;
                if (heDadoLikeData === null || heDadoLikeData === undefined) {
                    heDadoLikeBool = null; // indeterminado
                } else if (typeof heDadoLikeData === 'boolean') {
                    heDadoLikeBool = heDadoLikeData;
                } else if (typeof heDadoLikeData === 'number') {
                    // si el servicio devuelve un contador, >0 significa que dio like
                    heDadoLikeBool = heDadoLikeData > 0;
                } else if (typeof heDadoLikeData === 'object') {
                    // buscar campos comunes que indiquen existencia de like
                    heDadoLikeBool = !!(heDadoLikeData.dioLike ?? heDadoLikeData.exists ?? heDadoLikeData.count ?? heDadoLikeData.numeroLikes ?? heDadoLikeData.value);
                } else {
                    heDadoLikeBool = null;
                }
                setHeDadoLike(heDadoLikeBool);
                setHeDadoLikeLoaded(true);

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

            } catch (err) {
                console.error(err);
            }
        }
        fetchComentarios();
    }, [idRecuerdo]);


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



    if (error) {
        return <div>{error}</div>;
    }

    if (!recuerdo) {
        return <div>Cargando...</div>;
    }

    return (
        <div>
            <h1>{recuerdo.titulo}</h1>
            <p>{recuerdo.descripcion}</p>
            {/* Imagenes */}
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginTop: "20px"
                }}
            >
                {recuerdo.imagenes && recuerdo.imagenes.length > 0 ? (
                    recuerdo.imagenes.map((url, index) => (
                        <img
                            key={index}
                            src={url}
                            alt={`Recuerdo ${index + 1}`}
                            style={{width: "200px", height: "200px", objectFit: "cover"}}
                        />
                    ))
                ) : (
                    <p>No hay imágenes para este recuerdo.</p>
                )}
                <p>Likes : {likes}</p>
                {/* Mostrar botón solo si ya hemos cargado el estado y sabemos que NO ha dado like (heDadoLike === false). */}
                {heDadoLikeLoaded && heDadoLike === false && (
                    <button onClick={handleLikeRecuerdo} style={{marginTop: "10px"}}>Me gusta</button>
                )}

            </div>
            {/* Participantes */}
            <div style={{marginTop: "20px"}}>
                <h2>Participantes {participantes.length}</h2>
                {participantes && participantes.length > 0 ? (
                    <ul>
                        {participantes.map((participante, index) => (
                            <li key={index}><a href={`/usuario/${participante.idUsuario}`}>{participante.nombre}</a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <><p>No hay participantes para este recuerdo.</p>

                    </>
                )}
            </div>

            {/*Comentario*/}


            <div style={{marginTop: "20px"}}>
                <h2>Comentarios</h2>
                {comentarios && comentarios.length > 0 ? (
                    <ul>
                        {comentarios.map((comentario, index) => (
                            <li key={index}>
                                <p><strong>{comentario.idUsuario}:</strong> {comentario.mensaje}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No hay comentarios para este recuerdo.</p>
                )}

                {/*Crear comentario*/}
                <div style={{marginTop: "20px"}}>
                    <h3>Crear comentario</h3>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const texto = formData.get("texto") as string;
                        handleCrearComentario(texto);
                        e.currentTarget.reset();
                    }}>
                        <textarea name="texto" required placeholder="Escribe tu comentario aquí..."
                                  style={{width: "30%", height: "100px"}}/>
                        <button type="submit" style={{marginTop: "10px"}}>Enviar</button>
                    </form>

                </div>
            </div>

        </div>
    );
}