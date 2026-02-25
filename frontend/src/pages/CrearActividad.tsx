import { useState } from "react";
import { createActividad } from "../services/actividadService";
import { useNavigate } from "react-router-dom";

export default function CrearActividad() {
    const navigate = useNavigate();

    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [ubicacion, setUbicacion] = useState("");
    const [publica, setPublica] = useState(true);
    const [participantesmax, setParticipantesmax] = useState<number>(0);
    const [imagenUrl, setImagenUrl] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await createActividad({
                titulo,
                descripcion,
                fechaInicio: new Date(fechaInicio).toISOString(),
                fechaFin: new Date(fechaFin).toISOString(),
                ubicacion,
                publica,
                participantesmax: participantesmax || 0,
                imagenes: imagenUrl ? [imagenUrl] : []
            });

            navigate("/");
        } catch (err) {
            console.error(err);
            setError("Error al crear la actividad");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Crear Actividad</h1>

            <form onSubmit={handleSubmit}>
                {/* Título */}
                <input
                    type="text"
                    placeholder="Título"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                /><br/>

                {/* Descripción */}
                <textarea
                    placeholder="Descripción"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    required
                /><br/>

                {/* Fecha inicio */}
                <label>Fecha inicio</label>
                <input
                    type="datetime-local"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    required
                /><br/>

                {/* Fecha fin */}
                <label>Fecha fin</label>
                <input
                    type="datetime-local"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}

                /><br/>

                {/* Ubicación */}
                <input
                    type="text"
                    placeholder="Ubicación"
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                    required
                /><br/>

                {/* Pública / Privada */}
                <label>
                    <input
                        type="checkbox"
                        checked={publica}
                        onChange={(e) => setPublica(e.target.checked)}
                    />
                    Actividad pública
                </label>

                {/* Participantes máximos */}
                <input
                    type="number"
                    placeholder="Máx participantes (0 = sin límite)"
                    value={participantesmax}
                    onChange={(e) => setParticipantesmax(Number(e.target.value))}
                    min="0"
                />

                {/* Imagen opcional */}
                <input
                    type="text"
                    placeholder="URL imagen (opcional)"
                    value={imagenUrl}
                    onChange={(e) => setImagenUrl(e.target.value)}
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Creando..." : "Crear"}
                </button>

                {error && <p style={{ color: "red" }}>{error}</p>}
            </form>
        </div>
    );
}