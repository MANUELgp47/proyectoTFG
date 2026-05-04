//Crea recuerdo con el id de la actividad por parametro, el id del usuario se obtiene del token. Obtiene la lista de usuario que participaron en la actividad
import React, {useState} from "react";
import {crearRecuerdo} from "../services/recuerdoService";
import {getActividadesQueParticipo} from "../services/actividadService";
import {useParams} from "react-router-dom";

export default function CrearRecuerdo() {
    const {idActividad} = useParams();
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [error, setError] = useState("");

   // const [archivos, setArchivos] = useState<File[] | null>(null);
//const [imagenUrl, setImagenUrl] = useState <string | null>(null);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            //obtener mis actividades para comprobar que participe en la actividad
            const actividades = await getActividadesQueParticipo();
            const participoEnActividad = actividades.some((actividad: any) => actividad.idActividad === parseInt(idActividad!));

            if (!participoEnActividad) {
                setError("No puedes crear un recuerdo para una actividad en la que no participaste "  );

                return;
            }
            //compruebo que la actividad.estado sea finalizada
            const actividad = actividades.find((actividad: any) => actividad.idActividad === parseInt(idActividad!));
            console.log(actividad);
            if (actividad.estado !== "finalizada") {
                setError("No puedes crear un recuerdo para una actividad que no ha finalizado");
                return;
            }

            const respuesta = await crearRecuerdo(
                {
                    idActividad: parseInt(idActividad!),
                    titulo,
                    descripcion,
                    imagenes: [] // ver como hacerlo bien

                }
            )

            console.log("respuesta ", respuesta)
            alert("Recuerdo creado exitosamente");
        } catch (err) {
            setError("Error al crear el recuerdo");
        }
    };
/*
    const handleFile = (file: File) => {
        setArchivos(file);
        if (file && file.type.startsWith('image/')) {// Solo aceptamos imágenes
            setArchivo(file);
            // Creamos una URL temporal para ver la previsualización local
            setImagenUrl(URL.createObjectURL(file));
        }
    };*/

    return (
        <div>
            <h1>Crear Recuerdo</h1>
            {error && <p style={{color: "red"}}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Título:</label>
                    <input
                        type="text"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Descripción:</label>
                    <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Imagenes:</label>
                    <input
                        type="file"
                        multiple
                        //agregar un manejador para subir las imágenes
                    />
                </div>

                <button type="submit">Crear Recuerdo</button>
            </form>
        </div>
    );
}

