import { useState, useEffect } from 'react';
import { buscarUsuariosNombre, getDatosMinimosUsuario } from '../services/usuarioService';
import { Link } from 'react-router-dom';

export default function BuscarUsuario() {
    const [nombre, setNombre] = useState('');
    const [usuariosMinimos, setusuariosMinimos] = useState<Record<number, {
        idUsuario: number;
        nombreUsuario: string;
        imagen: string | undefined;
    }>>({});
  //  const [usuariosID, setUsuariosID] = useState<number[]>([]);

    // useEffect se dispara cada vez que "nombre" cambia
    useEffect(() => {
        // Si el input está vacío, limpiamos la lista y no buscamos
        if (nombre.trim() === '') {
            setusuariosMinimos({});
            return;
        }

        // Creamos el "Debounce": esperamos 400ms antes de lanzar la petición
        const timer = setTimeout(async () => {
            try {
                const resultados = await buscarUsuariosNombre(nombre);
             //   setUsuariosID(resultados);

                // Para cada idUsuario obtenido, hacemos una petición para obtener sus datos mínimos con getDatosMinimosUsuario
                const nuevosUsuariosMinimos: Record<number, {
                    idUsuario: number;
                    nombreUsuario: string;
                    imagen: string | undefined;
                }> = {};

                for (const resultado of resultados) {
                    const datosMinimos = await getDatosMinimosUsuario(resultado.idUsuario);
                    if (datosMinimos) {
                        nuevosUsuariosMinimos[resultado.idUsuario] = datosMinimos;
                    }
                }

                setusuariosMinimos(nuevosUsuariosMinimos);


            } catch (error) {
                console.error('Error al buscar usuarios:', error);
            }
        }, 400);


        return () => clearTimeout(timer);
    }, [nombre]);

    return (
        <div>
            <h2>Buscar Usuario</h2>
            <div className="search-container">
                <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Escribe para buscar..."
                    autoFocus
                />
                {/* El botón ya no es necesario para disparar la búsqueda,
                    pero puedes dejarlo visualmente o quitarlo */}
            </div>

            <div className="results-container">
                {Object.values(usuariosMinimos).length > 0 ? (
                    Object.values(usuariosMinimos).map((usuario) => (
                        <div key={usuario.idUsuario} style={{ marginBottom: '10px' }}>
                            <Link to={`/usuario/${usuario.idUsuario}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                                <img
                                    src={usuario.imagen || '/default-avatar.png'}
                                    alt={usuario.nombreUsuario}
                                    style={{ borderRadius: '50%', marginRight: '10px', objectFit: 'cover' }}
                                    width={50}
                                    height={50}
                                />
                                <span>{usuario.nombreUsuario}</span>
                            </Link>
                        </div>
                    ))
                ) : (
                    nombre.length > 0 && <p>No se encontraron usuarios.</p>
                )}
            </div>
        </div>
    );
}