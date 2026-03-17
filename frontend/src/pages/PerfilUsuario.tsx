//Este es le perfil de usuario, donde se muestra su informacion personal, un boton para editar su perfil(aun no funcional) y un boton para ver las actividades creadas por el usuario
import { useEffect, useState} from "react";
import {getUsuario} from "../services/usuarioService";
import {Link, useParams} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import {getAmistadEntreUsuarios, eliminarAmistad} from '../services/amistadService';
import type {Usuario, Amistad, SolicitudAmistad} from '../types.ts';
import {CrearSolicitud, getSolicitudAmistad} from "../services/solicitudAmistadService";
import {getChatIndividualPorUsuario, crearChatIndividual} from "../services/chatService";
import {getRecuerdosPorUsuario} from "../services/recuerdoService.ts";


export default function PerfilUsuario() {
    //idUsuario por parametero
    const {idUsuarios} = useParams<{ idUsuarios: string }>();
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [amistad, setAmistad] = useState<Amistad | null>(null);
    const [solicitud, setSolicitud] = useState<SolicitudAmistad | null>(null);
    const {idUsuario} = useAuth();
    const idSesion = idUsuario;
    const [recuerdos, setRecuerdos] = useState<any[]>([]);


    useEffect(() => {
        const fetchUsuario = async () => {

            try {
                const data = await getUsuario(Number(idUsuarios));

                setUsuario(data);
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

    return (
        <div>
            <h1>Perfil de {usuario.nombreUsuario}</h1>
            <p>Nombre completo : {usuario.nombre} {usuario.apellidos} </p>
            <p>Descripción: {usuario.descripcion}</p>
            <p>Ubicación: {usuario.ubicacion}</p>
            <p>Biografía: {usuario.biografia}</p>
            <p>Fecha de registro: {new Date(usuario.fechaRegistro).toLocaleDateString()}</p>

            <Link to={`/usuario/${idUsuarios}/actividadesCreadas`}>
                <button>Ver actividades creadas</button>
            </Link>
            <Link to={`/amistad/${idUsuarios} `}>
                <button>Ver amistades</button>
            </Link>
            {/*Si idSesion == usuario.idUsuario*/}
            {idSesion !== null && idSesion === Number(idUsuarios) && (
                <Link to={`/usuario/${idUsuarios}/editar`}>
                    <button>Editar perfil</button>
                </Link>)}


            {/*Si es mi amigo Boton borrar amistad*/}
            {amistad && (
                <>
                    <button onClick={handleEliminarAmistad}>Eliminar amistad</button>
                    <button onClick={handleChatear}>Chatear</button>
                </>
            )}


            {/*Si no hay amistad Boton de crear amistad*/}
            {!amistad && solicitud?.estado != 'pendiente' && (Number(idSesion) !== Number(idUsuarios)) && (
                <button onClick={handleEnviarSolicitudAmistad}>Enviar solicitud de amistad</button>
            )}
            {/*Si hay solicitud pendiente*/}
            {!amistad && solicitud && solicitud.estado === 'pendiente' && (
                <p>Solicitud de amistad pendiente</p>
            )}

            {/*Muestra los recuerdos que ha creado*/}
            <h2>Recuerdos creados por {usuario.nombreUsuario}</h2>
            {recuerdos.length === 0 ? (
                <p>No ha creado ningún recuerdo aún.</p>
            ) : (
                <ul>
                    {recuerdos.map((recuerdo) => (
                        <li key={recuerdo.idRecuerdo}>
                            <Link to={`/Recuerdo/${recuerdo.idRecuerdo}`}>
                                {recuerdo.titulo}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}


        </div>
    );
}