//Este es le perfil de usuario, donde se muestra su informacion personal, un boton para editar su perfil(aun no funcional) y un boton para ver las actividades creadas por el usuario
import {useEffect, useState} from "react";
import {getUsuario} from "../services/usuarioService";
//import { useAuth } from "../context/AuthContext";
import {Link, useParams} from "react-router-dom";
import {useIdSesionActual} from "../services/sesionService";
import {getAmistadEntreUsuarios, eliminarAmistad} from '../services/amistadService';
import type {Usuario, Amistad, SolicitudAmistad} from '../types';
import {creaSulicitud, getSolicitudAmistad} from "../services/solicitudAmistadService";

export default function PerfilUsuario() {
    //idUsuario por parametero de la url
    const {idUsuario} = useParams<{ idUsuario: string }>();
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [amistad, setAmistad] = useState<Amistad | null>(null);
    const [solicitud, setSolicitud] = useState<SolicitudAmistad | null>(null);
    const idSesion = useIdSesionActual();


    useEffect(() => {
        const fetchUsuario = async () => {

            try {
                const data = await getUsuario(Number(idUsuario));

                setUsuario(data);
            } catch (error) {

                console.error(error);
            }
        };

        fetchUsuario();
    }, [idUsuario]);

    useEffect(() => {
        const fetchAmistad = async () => {
            if (idSesion == null) {
                // si no hay sesión aún, no buscar amistad
                setAmistad(null);
                setSolicitud(null);
                return;
            }

            const fetchedSolicitud = await getSolicitudAmistad(Number(idUsuario));
            setSolicitud(fetchedSolicitud);
            const fetchedAmistad = await getAmistadEntreUsuarios(idSesion, Number(idUsuario));
            setAmistad(fetchedAmistad);





        };
        fetchAmistad();
    }, [idSesion, idUsuario]);

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
        console.log("solicitud"+solicitud)
        creaSulicitud(usuario.idUsuario);
        alert("Solicitud de amistad enviada");
        return;
    }

    return (
        <div>
            <h1>Perfil de {usuario.nombreUsuario}</h1>
            <p>Nombre completo : {usuario.nombre} {usuario.apellidos} </p>
            <p>Descripción: {usuario.descripcion}</p>
            <p>Ubicación: {usuario.ubicacion}</p>
            <p>Biografía: {usuario.biografia}</p>
            <p>Fecha de registro: {new Date(usuario.fechaRegistro).toLocaleDateString()}</p>

            <Link to={`/usuario/${idUsuario}/actividadesCreadas`}>
                <button>Ver actividades creadas</button>
            </Link>
            <Link to={`/amistad/${idUsuario} `}>
                <button>Ver amistades</button>
            </Link>
            {/*Si idSesion == usuario.idUsuario*/}
            {idSesion !== null && idSesion === Number(idUsuario) && (
                <Link to={`/usuario/${idUsuario}/editar`}>
                    <button>Editar perfil</button>
                </Link>)}


            {/*Si es mi amigo Boton borrar amistad*/}
            {amistad && (
                <button onClick={handleEliminarAmistad}>Eliminar amistad</button>
            )}

            {/*Si no hay amistad Boton de crear amistad*/}
            {!amistad && !solicitud && Number(idSesion) != Number(idUsuario) && (



                <button onClick={handleEnviarSolicitudAmistad}>Enviar solicitud de amistad</button>


            )}
                {/*Si hay solicitud pendiente*/}
            {!amistad && solicitud && solicitud.estado === 'pendiente' && (
                <p>Solicitud de amistad pendiente</p>
            )}


        </div>
    );
}