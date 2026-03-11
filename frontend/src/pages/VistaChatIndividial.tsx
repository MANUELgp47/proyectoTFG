//muestra los mensajes entre dos usuarios, con un input para enviar nuevos mensajes
import {useCallback, useEffect, useState} from "react";
import {getMensajesIndividual, crearMensajeChat, marcarMensajeComoLeidoIndividual} from "../services/mensajeService";
import {useParams, Navigate} from "react-router-dom";
import type {Mensaje} from '../types';
import { useAuth } from "../context/AuthContext";

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



    return (
        <div>
            <h1>Chat Individual</h1>
            <div>
                {mensajes.map((mensaje) => (

                    <div key={mensaje.idMensaje}>

                        <p>Id mensaje: {mensaje.idMensaje}</p>
                        {!mensaje.leido && mensaje.idEmisor != idSesion && null}

                        <p><strong>{mensaje.idEmisor}</strong>: {mensaje.contenido}</p>
                        {mensaje.leido && mensaje.idEmisor === idSesion && <span style={{color: 'green'}}> (Leído)</span>}

                    <br/><br/>

                    </div>
                ))}
            </div>
            <div>
                <input
                    type="text"
                    placeholder="Escribe tu mensaje..."
                    value={contenidoNuevoMensaje}
                    onChange={(e) => setContenidoNuevoMensaje(e.target.value)}
                />
                <button onClick={() => handleEnviarMensaje(contenidoNuevoMensaje)}>Enviar</button>
            </div>
        </div>
    );
}
