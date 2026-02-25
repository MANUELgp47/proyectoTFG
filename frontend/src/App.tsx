import {Routes, Route} from "react-router-dom";
//import PrivateRoute from "./routes/PrivateRoute";
import ActividadesCreadas from "./pages/ActividadesCreadas";
import CrearActividad from "./pages/CrearActividad";
import MisActividades from "./pages/MisActividades";

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


        </Routes>
    );
}