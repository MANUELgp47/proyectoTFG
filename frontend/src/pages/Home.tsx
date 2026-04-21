import {useEffect, useState} from "react";
import {getActividadesFiltro} from "../services/actividadService";
import {useAuth} from "../context/AuthContext";
import {Link} from "react-router-dom";
import {getActividades} from "../services/actividadService.ts";
import {getTags} from "../services/tagService.ts";
//import type {Actividad} from "../types.ts";
import '../index.css';

//estilo
//import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
//importar index.css para estilos globales


import {Search, Bell, SlidersHorizontal, User, LogOut, LogIn, Calendar, Users, MapPin} from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { Checkbox } from "../components/ui/checkbox";


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
        <div
            className="min-h-screen bg-[#EEF2FB]"
            style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
        >
            <div className="max-w-[1200px] mx-auto px-6 py-6">
                {/* ========== TOP BAR ========== */}
                <header className="flex items-center gap-3">
                    {/* Buscador */}
                    <div className="flex-1 max-w-md relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral" />
                        <input
                            type="text"
                            placeholder="Buscar título..."
                            value={filtros.titulo}
                            onChange={(e) =>
                                setFiltros({ ...filtros, titulo: e.target.value })
                            }
                            className="w-full bg-white rounded-full pl-11 pr-4 py-3 text-sm text-secondary placeholder-neutral outline-none focus:ring-2 focus:ring-primary-100 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                        />
                    </div>

                    {/* Filtros */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-secondary font-semibold text-sm hover:bg-slate-50 transition shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                Filtros
                            </button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="end"
                            className="w-80 p-5 rounded-2xl bg-white border border-slate-200 shadow-xl"
                        >
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-neutral uppercase tracking-wider">
                                        Ubicación
                                    </label>
                                    <input
                                        placeholder="Ubicación"
                                        value={filtros.ubicacion}
                                        onChange={(e) =>
                                            setFiltros({ ...filtros, ubicacion: e.target.value })
                                        }
                                        className="mt-1 w-full bg-slate-50 rounded-lg px-3 py-2 text-sm text-secondary outline-none focus:ring-2 focus:ring-primary-100"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-neutral uppercase tracking-wider">
                                        Máx participantes
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Máx participantes"
                                        value={filtros.participantesmax}
                                        onChange={(e) =>
                                            setFiltros({
                                                ...filtros,
                                                participantesmax: e.target.value,
                                            })
                                        }
                                        className="mt-1 w-full bg-slate-50 rounded-lg px-3 py-2 text-sm text-secondary outline-none focus:ring-2 focus:ring-primary-100"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-neutral uppercase tracking-wider">
                                        Fecha inicio desde
                                    </label>
                                    <input
                                        type="date"
                                        value={filtros.fecha}
                                        onChange={(e) =>
                                            setFiltros({ ...filtros, fecha: e.target.value })
                                        }
                                        className="mt-1 w-full bg-slate-50 rounded-lg px-3 py-2 text-sm text-secondary outline-none focus:ring-2 focus:ring-primary-100"
                                    />
                                </div>

                                <label className="flex items-center gap-2 text-sm text-secondary cursor-pointer">
                                    <Checkbox
                                        checked={filtros.publica}
                                        onCheckedChange={(v) =>
                                            setFiltros({ ...filtros, publica: v === true })
                                        }
                                    />
                                    Solo públicas
                                </label>

                                {tagsDisponibles.length > 0 && (
                                    <div>
                                        <div className="text-xs font-semibold text-neutral uppercase tracking-wider mb-2">
                                            Tags
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {tagsDisponibles.map((tag) => {
                                                const active = filtros.tags.includes(tag);
                                                return (
                                                    <button
                                                        key={tag}
                                                        type="button"
                                                        onClick={() =>
                                                            setFiltros({
                                                                ...filtros,
                                                                tags: active
                                                                    ? filtros.tags.filter((t) => t !== tag)
                                                                    : [...filtros.tags, tag],
                                                            })
                                                        }
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                                                            active
                                                                ? "bg-primary text-white"
                                                                : "bg-neutral-light text-neutral hover:bg-slate-200"
                                                        }`}
                                                    >
                                                        {tag}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Campanita */}
                    {isAuthenticated && (
                        <Link to="/notificaciones">
                            <button
                                type="button"
                                className="relative w-11 h-11 rounded-full bg-white flex items-center justify-center text-neutral hover:text-secondary transition shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                                aria-label="Notificaciones"
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-tertiary" />
                            </button>
                        </Link>
                    )}

                    {/* Usuario */}
                    {!isAuthenticated ? (
                        <Link to="/login">
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-600 transition"
                            >
                                <LogIn className="w-4 h-4" />
                                Log in
                            </button>
                        </Link>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-600 transition"
                                    aria-label="Usuario"
                                >
                                    <User className="w-5 h-5" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-52 rounded-xl bg-white border border-slate-200 shadow-xl"
                            >
                                {idUsuario != null && (
                                    <DropdownMenuItem asChild>
                                        <Link to={`/usuario/${idUsuario}`}>Mi perfil</Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem asChild>
                                    <Link to="/misActividades">Mis actividades</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to="/actividad/crear">Crear actividad</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to="/settings">Ajustes</Link>
                                </DropdownMenuItem>
                                {rol === "admin" && (
                                    <DropdownMenuItem asChild>
                                        <Link to="/admin/crearTag">Gestionar tags</Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => logout()}
                                    className="text-red-600 focus:text-red-700"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Cerrar sesión
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </header>

                {/* ========== TÍTULO ========== */}
                <section className="mt-10">
                    <h1
                        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-secondary tracking-tight"
                        style={{ fontFamily: "'Manrope', sans-serif" }}
                    >
                        Actividades disponibles
                    </h1>
                </section>

                {/* ========== LISTA DE ACTIVIDADES ========== */}
                <section className="mt-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {actividades.map((act) => {
                            const imagenUrl: string | null = act.imagen ?? null;
                            const creadorNombre: string =
                                act.creador?.nombre ?? "Nombre creador";
                            const creadorFoto: string | null = act.creador?.foto ?? null;
                            const fecha: string = act.fechaInicio ?? "12 Jun • 19:00";
                            const ubicacion: string = act.ubicacion ?? "Ubicación de ejemplo";
                            const participantes: number = act.participantes ?? 3;
                            const participantesMax: number = act.participantesmax ?? 10;

                            return (
                                <Link
                                    key={act.idActividad}
                                    to={`/actividad/${act.idActividad}`}
                                    className="group rounded-3xl bg-white shadow-[0_2px_20px_rgba(15,23,42,0.06)] p-4 flex flex-col transition hover:shadow-[0_12px_30px_rgba(15,23,42,0.10)] hover:-translate-y-0.5 no-underline"
                                >
                                    {/* Imagen con fallback negro */}
                                    <div className="relative w-full aspect-[4/3] rounded-2xl bg-black overflow-hidden">
                                        {imagenUrl && (
                                            <img
                                                src={imagenUrl}
                                                alt={act.titulo}
                                                className="absolute inset-0 w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).style.display =
                                                        "none";
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* Contenido */}
                                    <div className="px-2 pt-5 pb-2 flex flex-col flex-1">
                                        <h3
                                            className="text-[19px] font-extrabold text-secondary leading-snug tracking-tight group-hover:text-primary transition"
                                            style={{ fontFamily: "'Manrope', sans-serif" }}
                                        >
                                            {act.titulo}
                                        </h3>

                                        <div className="mt-4 space-y-2.5 text-neutral text-sm">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-primary" />
                                                <span className="truncate">{ubicacion}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-primary" />
                                                <span>{fecha}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-primary" />
                                                <span>
                          {participantesMax === 0 ? (
                              <>{participantes} sin límite</>
                          ) : (
                              <>{participantes}/{participantesMax} participantes</>
                          )}
                        </span>
                                            </div>
                                        </div>

                                        {/* Creador */}
                                        <div className="mt-auto pt-6 flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-secondary overflow-hidden flex items-center justify-center text-white text-xs font-semibold">
                                                {creadorFoto ? (
                                                    <img
                                                        src={creadorFoto}
                                                        alt={creadorNombre}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.currentTarget as HTMLImageElement).style.display =
                                                                "none";
                                                        }}
                                                    />
                                                ) : (
                                                    creadorNombre.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <span className="text-secondary text-sm font-medium truncate">
                        {creadorNombre}
                      </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}

                        {actividades.length === 0 && (
                            <div className="col-span-full text-center py-16 text-neutral">
                                No hay actividades que mostrar.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
