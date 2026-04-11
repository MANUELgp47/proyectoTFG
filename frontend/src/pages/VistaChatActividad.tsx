//Muestra el chat de una actividad específica. El ID de la actividad se obtiene de la URL.
import {useEffect, useState} from "react";
import {Navigate, useParams} from "react-router-dom";
import {getChatActividad} from "../services/chatService";
import {crearMensajeChat, getMensajesActividad} from "../services/mensajeService";
import type {ChatActividad, Mensaje} from "../types.ts";
import {useAuth} from "../context/AuthContext.tsx";

export default function VistaChatActividad() {
    const {idActividad} = useParams<{ idActividad: string }>();
    const [chat, setChat] = useState<ChatActividad | null>(null);
    const [error, setError] = useState("");
    const { loading, idUsuario, isAuthenticated } = useAuth();
    const idSesion = idUsuario;
    const [mensajes, setMensajes] = useState<Mensaje[] | null>(null);
    const {idChatActividad} = useParams<{ idChatActividad: string }>();
    const [contenidoNuevoMensaje, setContenidoNuevoMensaje] = useState("");

    // Si estamos inicializando el provider esperar
    if (loading) {
        return <div>loading...</div>;
    }

    // Si no esta autenticado, redirigir a login (o mostrar mensaje de no autorizado)
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Si esta autenticado pero ayn no podemos obtener idUsuario, esperar (posible token inválido)
    if (idSesion == null) {
        return <div>Cargando sesión...</div>;
    }

    useEffect(() => {
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


    useEffect(() => {
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
        }, 3000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [idChatActividad, isAuthenticated, idSesion]);
/*
    if (!mensajes) {
        return <div>Cargando...</div>;
    }
*/


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


    return (
        <div>
            <h1>Chat Actividad</h1>
            <div>
                {/*Si mensajees not null*/}

                {mensajes && mensajes.map((mensaje) => (

                    <div key={mensaje.idMensaje}>

                        <p>Id mensaje: {mensaje.idMensaje}</p>


                        <p><strong>{mensaje.idEmisor}</strong>: {mensaje.contenido}</p>


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