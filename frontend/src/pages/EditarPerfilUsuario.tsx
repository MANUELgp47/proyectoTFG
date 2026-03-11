import { useEffect, useState } from "react";
import { getUsuario, updateUsuario } from "../services/usuarioService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function EditarPerfilUsuario() {

    const [usuario, setUsuario] = useState<any>(null);

    const navigate = useNavigate();
    const { idUsuario } = useAuth();

    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                if (idUsuario == null) return;
                console.log("Obteniendo datos del usuario...");
                const response = await getUsuario(Number(idUsuario));

                setUsuario(response);
            } catch (error) {
                console.error(error);
            }
        };

        fetchUsuario();
    }, [idUsuario]);

    if (!usuario) {
        return <div>Cargando...</div>;
    }


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateUsuario({
                nombre: usuario.nombre,
                apellidos: usuario.apellidos,
                biografia: usuario.biografia,
                ubicacion: usuario.ubicacion
            });
            navigate(`/usuario/${idUsuario}`);//vuleve al perfil del usuario
        } catch (error) {
            console.error(error);
        }

    }




    return (
        <div>
            <h1>Editar perfil de {usuario.nombre}</h1>

            <form onSubmit={handleSubmit}>
                <input
                    value={usuario.nombre}
                    onChange={(e) => setUsuario({ ...usuario, nombre: e.target.value })}
                /><br/>
                <input
                    value={usuario.apellidos}
                    onChange={(e) => setUsuario({ ...usuario, apellidos: e.target.value })}
                /><br/>

                <textarea
                    value={usuario.biografia}
                    onChange={(e) => setUsuario({ ...usuario, biografia: e.target.value })}
                /><br/>
                <input
                    value={usuario.ubicacion}
                    onChange={(e) => setUsuario({ ...usuario, ubicacion: e.target.value })}
                /><br/>
                <button type="submit">Guardar cambios</button>
            </form>

        </div>
    );};
