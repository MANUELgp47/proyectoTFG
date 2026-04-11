import {useEffect, useState} from "react";
import {getActividadesFiltro} from "../services/actividadService";
import {useAuth} from "../context/AuthContext";
import {Link} from "react-router-dom";
import {getActividades} from "../services/actividadService.ts";
import {getTags} from "../services/tagService.ts";
//import type {Actividad} from "../types.ts";

export default function Home() {
    const [actividades, setActividades] = useState<any[]>([]);
    const {isAuthenticated, idUsuario, rol} = useAuth();
    const [tagsDisponibles, setTagsDisponibles] = useState<string[]>([]);
    const [filtros, setFiltros] = useState({
        titulo: "",
        ubicacion: "",
        participantesmax: "",
        publica: false,
        fecha: "",
        tags: [] as string[]
    });


    const {logout} = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getActividades();
                setActividades(data);
                const tags = await getTags();
                setTagsDisponibles(tags.map((t: any) => t.nombre));
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);
    useEffect(() => {

        const fetchActividades = async () => {

            const params = new URLSearchParams();

            if (filtros.titulo) params.append("titulo", filtros.titulo);
            if (filtros.ubicacion) params.append("ubicacion", filtros.ubicacion);
            if (filtros.participantesmax) params.append("participantesmax", filtros.participantesmax);
            if (filtros.publica) params.append("publica", "true");
            if (filtros.fecha) params.append("fecha", filtros.fecha);
            if (filtros.tags.length > 0) {
                params.append("tags", filtros.tags.join(","));
            }


            const response = await getActividadesFiltro(params.toString())

            const data = await response;
            console.log(data);
            setActividades(data);
        };
        const timeout = setTimeout(() => { // Agrega un retraso de 300ms para evitar llamadas excesivas
            fetchActividades();
        }, 300);

        return () => clearTimeout(timeout);

    }, [filtros]);


    return (
        <div>
            <h1>Actividades disponibles</h1>


            {!isAuthenticated && (
                <Link to="/login">
                    <button>Log in</button>
                </Link>
            )}

            {isAuthenticated && (
                <Link to="/actividad/crear">
                    <button>Crear actividad</button>
                </Link>
            )}
            {isAuthenticated && (
                <Link to="/notificaciones">
                    <button>Ver notificaciones</button>
                </Link>
            )}
            {isAuthenticated && (
                <Link to="/misActividades">
                    <button>Mis Actividades</button>
                </Link>
            )}
            {isAuthenticated && idUsuario != null && (
                <Link to={`/usuario/${idUsuario}`}>
                    <button>Mi perfil</button>
                </Link>
            )}

            {isAuthenticated && idUsuario != null && (

                <button onClick={() => logout()}>
                    Logout</button>

            )}
            {/*ADMIN*/}
            {isAuthenticated && rol === 'admin' && (
                <Link to="/admin/crearTag">
                    <button>Gestionar Tags</button>
                </Link>
            )}

            <br/>
            <br/>
            <br/>
            <input
                placeholder="Buscar título..."
                value={filtros.titulo}
                onChange={(e) =>
                    setFiltros({...filtros, titulo: e.target.value})
                }
            />

            <input
                placeholder="Ubicación"
                value={filtros.ubicacion}
                onChange={(e) =>
                    setFiltros({...filtros, ubicacion: e.target.value})
                }
            />

            <input
                type="number"
                placeholder="Máx participantes"
                value={filtros.participantesmax}
                onChange={(e) =>
                    setFiltros({...filtros, participantesmax: e.target.value})
                }
            />

            <label>
                <input
                    type="checkbox"
                    checked={filtros.publica}
                    onChange={(e) =>
                        setFiltros({...filtros, publica: e.target.checked})
                    }
                />
                Solo públicas
            </label>
            <label>
                *Fecha inicio a partir de:
                <input
                    type="date"
                    value={filtros.fecha}
                    onChange={(e) =>
                        setFiltros({...filtros, fecha: e.target.value})
                    }
                />

            </label><br/>
            <h3>Tags (que tenga alguno de ellos)</h3>
            {tagsDisponibles.map((tag) => (

                <label key={tag}>
                    <input
                        type="checkbox"
                        checked={filtros.tags.includes(tag)}
                        onChange={() => {
                            if (filtros.tags.includes(tag)) {
                                setFiltros({
                                    ...filtros,
                                    tags: filtros.tags.filter(t => t !== tag)
                                });
                            } else {
                                setFiltros({
                                    ...filtros,
                                    tags: [...filtros.tags, tag]
                                });
                            }
                        }}
                    />
                    {tag}
                </label>
            ))}
            <br/> <h2>Actividades</h2>
            {actividades.map((act) => (
                <div key={act.idActividad ?? act.idActividad}>
                    <a href={`/actividad/${act.idActividad}`}>{act.titulo}</a>
                    <p>{act.descripcion}</p>
                </div>
            ))}
        </div>

    );
}
