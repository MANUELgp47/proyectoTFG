//muestra la lista de amigos del usuario, con un enlace a su perfil
import { useEffect, useState } from 'react';
import {getAmistades} from '../services/amistadService';
import {getUsuario} from '../services/usuarioService';
import {Link, useParams} from 'react-router-dom';


export default function ListaAmigos() {
    const [amigos, setAmigos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    //const {idUsuarioParametros} = useParams<{ idUsuario: string }>();
    const {idUsuarioParametros} = useParams<{ idUsuarioParametros: string }>();
    //const {idUsuarios} = useParams<{ idUsuarios: string }>();

    useEffect(() => {
        const fetchAmigos = async () => {
            try {
                const amigosData = await getAmistades(Number(idUsuarioParametros));
                console.log("amigos", amigos)
                const amigosConDetalles = await Promise.all(
                    amigosData.map(async (amistad: any) => {//obtenemos el nombre de usuario y el id del amistad,
                        let usuario;
                        let idAmigo;
                        //TODO ver esto
                        if (Number(amistad.idUsuario1) == Number(idUsuarioParametros)) {
                            idAmigo = amistad.idUsuario2;//si el idUsuario es el idUsuario1, entonces el amigo es el idUsuario2
                            usuario = await getUsuario(idAmigo);
                        }else
                        {
                            idAmigo = amistad.idUsuario1;
                            usuario = await getUsuario(idAmigo);//si el idUsuario es el idUsuario2, entonces el amigo es el idUsuario1
                        }


                        return {
                            idUsuario: idAmigo,
                            nombreUsuario: usuario.nombreUsuario
                        };
                    })
                );
                setAmigos(amigosConDetalles);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchAmigos();
    }, []);

    if (loading) return <p>Cargando...</p>;

    return (
        <div>
            <h1>Lista de amigos</h1>


            {amigos.length === 0 ? (
                <p>No tienes amigos aún.</p>
            ) : (
                amigos.map((amigo) => (
                    <div key={amigo.idAmigo}>
                        <Link to={`/usuario/${amigo.idUsuario}`}>
                            <h3>{amigo.nombreUsuario}</h3>
                        </Link>
                    </div>
                ))
            )}
        </div>
    );
}