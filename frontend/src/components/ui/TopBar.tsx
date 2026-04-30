import { Link } from "react-router-dom";
import {Bell, User, LogOut, LogIn, Home} from "lucide-react";



import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./dropdown-menu";
import {useAuth} from "../../context/AuthContext.tsx";




interface TopBarProps {
    children?: React.ReactNode; // contenido central opcional (buscador, filtros, etc.)
}

export default function TopBar({ children }: TopBarProps) {
    const {isAuthenticated, logout, idUsuario, rol} = useAuth();

    return (
        <header className="flex items-center gap-3 mb-6">
            {/* Contenido central opcional (buscador, filtros...) */}
            <div className="flex-1 flex items-center gap-3">{children}</div>

            {/* Botón Home */}
            <Link to="/">
                <button
                    type="button"
                    className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-neutral hover:text-primary transition shadow-[0_1px_2px_rgba(15,23,42,0.04)] border border-slate-100"
                    aria-label="Ir a Inicio"
                >
                    <Home className="w-5 h-5" />
                </button>
            </Link>

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
    );
}