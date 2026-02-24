import { Routes, Route } from "react-router-dom";
//import PrivateRoute from "./routes/PrivateRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
//import Registro from "./pages/Registro";


export default function App() {
    return (

        <Routes>
            {/*  Rutas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />


            {/* Rutas privadas */}


        </Routes>
    );
}