import {Routes, Route} from "react-router-dom";
//import PrivateRoute from "./routes/PrivateRoute";
import ActividadesCreadas from "./pages/ActividadesCreadas";
import CrearActividad from "./pages/CrearActividad";
import EditarActividad from "./pages/EditarActividad.tsx";
import MisActividades from "./pages/MisActividades";
import {ActividadDetalle} from "./pages/ActividadDetalle";
import Notificaciones from "./pages/Notificaciones";
import VistaNotificacion from "./pages/VistaNotificacion.tsx";
import PerfilUsuario from "./pages/PerfilUsuario";
import EditarPerfilUsuario from "./pages/EditarPerfilUsuario.tsx";
import ListaAmigos from "./pages/ListaAmigos.tsx";

import Home from "./pages/Home";
import Login from "./pages/Login";

//import Registro from "./pages/Registro";


export default function App() {
    return (

        <Routes>
            {/*  Rutas públicas */}
            <Route path="/" element={<Home/>}/>
            <Route path="/login" element={<Login/>}/>


            {/* Rutas privadas */}

            <Route
                path="/usuario/:id/actividadesCreadas"
                element={<ActividadesCreadas/>}
            />
            <Route
                path="actividad/crear"
                element={<CrearActividad/>}
            />
            <Route
                path="misActividades"
                element={<MisActividades/>}
            />
            <Route
                path="/ActualizarActividad/:id"
                element={<EditarActividad/>}
            />

            <Route
                path="/actividad/:id"
                element={<ActividadDetalle/>}
            />
            <Route
                path="/notificaciones"
                element={<Notificaciones/>}
            />
            <Route
                path="/notificaciones/:idNotificacion"
                element={<VistaNotificacion/>}
            />

            <Route
                path="/usuario/:idUsuario"
                element={<PerfilUsuario/>}
            />
            <Route
                path="/usuario/:idUsuario/editar"
                element={<EditarPerfilUsuario/>}
            />
             <Route
                path="/amistad/:idUsuario/"
                element={<ListaAmigos/>}
            />




        </Routes>
    );
}