import {useState, useEffect, useRef} from "react";
import {createActividad} from "../services/actividadService";

import {asignarTagActividad, getTags} from "../services/tagService";
import {useNavigate} from "react-router-dom";
import {
    Calendar,
    CalendarX,
    Users,
    MapPin,
    Upload,
} from "lucide-react";
import TopBar from "../components/ui/TopBar.tsx";

export default function CrearActividad() {
    const navigate = useNavigate();

    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [ubicacion, setUbicacion] = useState("");
    const [publica, setPublica] = useState(true);
    const [participantesmax, setParticipantesmax] = useState<number>(0);
    const [imagenUrl, setImagenUrl] = useState <string | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [archivo, setArchivo] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    // Tags: cargar y seleccionar múltiples
    type Tag = { idTag: number; nombre: string };
    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);

    useEffect(() => {
        const cargarTags = async () => {
            try {
                const t = await getTags();
                // Si getTags devuelve objetos con otra forma, ajustar aquí
                setTags(t || []);
            } catch (err) {
                console.error("Error cargando tags:", err);
            }
        };

        cargarTags();
    }, []);

    const toggleTag = (id: number) => {
        setSelectedTags(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setError("");
            setLoading(true);

            const formData = new FormData();

            try {
                /*     const nuevaActividad = await createActividad({
                          titulo,
                          descripcion,
                          fechaInicio: new Date(fechaInicio).toISOString(),
                          fechaFin: new Date(fechaFin).toISOString(),
                          ubicacion,
                          publica,
                          participantesmax: participantesmax || 0,
                          imagenes: imagenUrl ? [imagenUrl] : []
                      });*/



                console.log("Datos a enviar:", titulo, archivo );

                formData.append('titulo', titulo);
                formData.append('descripcion', descripcion);
                formData.append('fechaInicio', new Date(fechaInicio).toISOString());
                formData.append('fechaFin', new Date(fechaFin).toISOString());
                formData.append('ubicacion', ubicacion);
                formData.append('publica', String(publica)); // FormData solo guarda strings
                formData.append('participantesmax', String(participantesmax || 0));


                // Mandamos los ARCHIVOS nuevos (los que vienen del input file)
                if (archivo) {
                    formData.append('imagenes', archivo); // 'imagenes' debe coincidir con upload.array('imagenes') en el back
                }


                const nuevaActividad = await createActividad(formData);

                console.log("nueva actividad", nuevaActividad);
                // Asignar tags uno a uno si se seleccionaron
                if (selectedTags && selectedTags.length > 0 && nuevaActividad && nuevaActividad.idActividad) {
                    try {
                        await Promise.all(
                            selectedTags.map(idTag => asignarTagActividad(nuevaActividad.idActividad, idTag))
                        );
                    } catch (err) {
                        console.error('Error asignando tags a la actividad:', err);
                        // No lanzamos para no impedir la navegación; avisamos al usuario
                        setError(prev => prev ? prev + ' | Error asignando tags' : 'Error asignando tags');
                    }
                }

                navigate("/");
            } catch
                (err) {
                console.error(err);
                setError("Error al crear la actividad");
            } finally {

                setLoading(false);
            }
        }
    ;


// Función para manejar el archivo (sea por clic o por arrastre)
    const handleFile = (file: File) => {
        setArchivo(file);
        if (file && file.type.startsWith('image/')) {// Solo aceptamos imágenes
            setArchivo(file);
            // Creamos una URL temporal para ver la previsualización local
            setImagenUrl(URL.createObjectURL(file));
        }
    };

// Limpieza de memoria (importante en React)
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    return (
        <div className="min-h-screen bg-[#F8F9FB]">
            <div className="max-w-[1100px] mx-auto px-6 py-6">
                <TopBar/>

                {/* Cabecera */}
                <div className="mt-4 mb-8">
                    <h1
                        className="text-4xl sm:text-5xl font-extrabold text-secondary tracking-tight"
                        style={{fontFamily: "'Manrope', sans-serif"}}
                    >
                        Crear nueva actividad
                    </h1>
                    <p className="mt-3 text-neutral max-w-md">
                        Diseña tu próxima experiencia. Prepara el escenario para un encuentro
                        memorable con cada detalle bien cuidado.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ============ CARD 1: TÍTULO + DESCRIPCIÓN ============ */}
                    <div className="bg-white rounded-3xl p-7 shadow-sm space-y-6">
                        <div>
                            <label className="text-[10px] font-bold tracking-[0.18em] text-neutral uppercase">
                                Título de la actividad
                            </label>
                            <input
                                type="text"
                                placeholder="¿Cuál es la ocasión?"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                required
                                className="mt-2 w-full bg-transparent border-b-2 border-slate-200 focus:border-primary outline-none text-2xl sm:text-3xl font-bold text-secondary placeholder-neutral/50 pb-3 transition"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-bold tracking-[0.18em] text-neutral uppercase">
                                La historia
                            </label>
                            <textarea
                                placeholder="Describe el ambiente, los objetivos y qué pueden esperar los invitados..."
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                required
                                rows={4}
                                className="mt-2 w-full bg-transparent border-b-2 border-slate-200 focus:border-primary outline-none text-base text-secondary placeholder-neutral/50 pb-3 transition resize-none"
                            />
                        </div>
                    </div>

                    {/* ============ CARD 2: TIMELINE + PREVIEW ============ */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
                        {/* Timeline + Capacity */}
                        <div className="bg-white rounded-3xl p-7 shadow-sm space-y-6">
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.18em] text-neutral uppercase">
                                    Fechas
                                </label>
                                <div className="mt-3 space-y-3">
                                    <div className="flex items-center gap-3 bg-neutral-light rounded-xl px-4 py-3">
                                        <Calendar className="w-5 h-5 text-primary shrink-0"/>
                                        <input
                                            type="datetime-local"
                                            value={fechaInicio}
                                            onChange={(e) => setFechaInicio(e.target.value)}
                                            required
                                            className="flex-1 bg-transparent outline-none text-sm text-secondary"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 bg-neutral-light rounded-xl px-4 py-3">
                                        <CalendarX className="w-5 h-5 text-primary shrink-0"/>
                                        <input
                                            type="datetime-local"
                                            value={fechaFin}
                                            onChange={(e) => setFechaFin(e.target.value)}
                                            className="flex-1 bg-transparent outline-none text-sm text-secondary"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold tracking-[0.18em] text-neutral uppercase">
                                    Capacidad de invitados
                                </label>
                                <div className="mt-3 flex items-center gap-3 bg-neutral-light rounded-xl px-4 py-3">
                                    <Users className="w-5 h-5 text-primary shrink-0"/>
                                    <input
                                        type="number"
                                        placeholder="Máx. participantes (0 = sin límite)"
                                        value={participantesmax}
                                        onChange={(e) =>
                                            setParticipantesmax(Number(e.target.value))
                                        }
                                        min="0"
                                        className="flex-1 bg-transparent outline-none text-sm text-secondary placeholder-neutral"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Visual Preview */}
                        <div className="bg-white rounded-3xl p-5 shadow-sm">
                            <div
                                className="text-[10px] font-bold tracking-[0.18em] text-neutral uppercase mb-3 px-2">
                                Previsualización
                            </div>
                            <div
                                className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black flex items-end p-6"
                                style={{
                                    background: imagenUrl
                                        ? "#000"
                                        : "linear-gradient(135deg, #0056D2 0%, #00E5FF 100%)",
                                }}
                            >
                                {imagenUrl && (
                                    <img
                                        src={imagenUrl}
                                        alt="Preview"
                                        className="absolute inset-0 w-full h-full object-cover"
                                        onError={(e) =>
                                            ((e.currentTarget as HTMLImageElement).style.display = "none")
                                        }
                                    />
                                )}
                                <div className="relative">
                                    <div className="text-white/70 text-xs font-bold tracking-wider uppercase">
                                        Tu actividad
                                    </div>
                                    <div
                                        className="text-white text-2xl font-extrabold mt-1 line-clamp-2"
                                        style={{fontFamily: "'Manrope', sans-serif"}}
                                    >
                                        {titulo || "Tu título aparecerá aquí"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ============ CARD 3: UBICACIÓN + PRIVACIDAD + TAGS | MEDIA ============ */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
                        {/* Ubicación + Privacidad + Tags */}
                        <div className="bg-white rounded-3xl p-7 shadow-sm space-y-6">
                            {/* Ubicación */}
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.18em] text-neutral uppercase">
                                    Ubicación
                                </label>
                                <div className="mt-3 flex items-center gap-3 bg-neutral-light rounded-xl px-4 py-3">
                                    <MapPin className="w-5 h-5 text-primary shrink-0"/>
                                    <input
                                        type="text"
                                        placeholder="Añade una dirección física o un enlace virtual"
                                        value={ubicacion}
                                        onChange={(e) => setUbicacion(e.target.value)}
                                        required
                                        className="flex-1 bg-transparent outline-none text-sm text-secondary placeholder-neutral"
                                    />
                                </div>
                            </div>

                            {/* Privacidad — toggle Pública/Privada */}
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.18em] text-neutral uppercase">
                                    Privacidad
                                </label>
                                <p className="text-xs text-neutral mt-1">
                                    ¿Quién podrá ver y unirse a esta actividad?
                                </p>
                                <div className="mt-3 inline-flex items-center bg-neutral-light rounded-full p-1">
                                    <button
                                        type="button"
                                        onClick={() => setPublica(true)}
                                        className={`px-6 py-2 rounded-full text-sm font-semibold transition ${
                                            publica
                                                ? "bg-white text-primary shadow-sm"
                                                : "text-neutral hover:text-secondary"
                                        }`}
                                    >
                                        Pública
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPublica(false)}
                                        className={`px-6 py-2 rounded-full text-sm font-semibold transition ${
                                            !publica
                                                ? "bg-white text-primary shadow-sm"
                                                : "text-neutral hover:text-secondary"
                                        }`}
                                    >
                                        Privada
                                    </button>
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="text-[10px] font-bold tracking-[0.18em] text-neutral uppercase">
                                    Tags
                                </label>
                                <p className="text-xs text-neutral mt-1">
                                    Elige ninguno o varios.
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {tags.length === 0 ? (
                                        <p className="text-sm text-neutral">Cargando tags...</p>
                                    ) : (
                                        tags.map((tag) => {
                                            const active = selectedTags.includes(tag.idTag);
                                            return (
                                                <button
                                                    key={tag.idTag}
                                                    type="button"
                                                    onClick={() => toggleTag(tag.idTag)}
                                                    className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                                                        active
                                                            ? "bg-primary text-white"
                                                            : "bg-neutral-light text-secondary hover:bg-slate-200"
                                                    }`}
                                                >
                                                    #{tag.nombre}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Media (imagen) */}
                        <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto p-4">
                            {/* Etiqueta superior */}
                            <label className="text-sm font-black text-slate-700 uppercase tracking-widest ml-2">
                                Imagen de la actividad
                            </label>

                            {/* Zona de carga / Drop Zone */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragging(false);
                                    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
                                }}
                                className={`
      relative min-h-[250px] w-full rounded-[2.5rem] border-2 border-dashed transition-all duration-300 cursor-pointer
      flex flex-col items-center justify-center p-6 overflow-hidden
      ${isDragging
                                    ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-lg'
                                    : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50'
                                }
    `}
                            >
                                {/* Input de tipo archivo (Oculto) */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                                />

                                {previewUrl ? (
                                    /* Vista de Previsualización cuando ya hay una imagen elegida */
                                    <div className="relative w-full h-full flex flex-col items-center group">
                                        <div
                                            className="relative w-full max-h-[350px] rounded-2xl overflow-hidden shadow-md">
                                            <img
                                                src={previewUrl}
                                                alt="Vista previa"
                                                className="w-full h-full object-contain"
                                            />
                                            {/* Capa de hover para indicar que se puede cambiar */}
                                            <div
                                                className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white">
                                                <Upload className="w-8 h-8 mb-2 animate-bounce"/>
                                                <span
                                                    className="font-bold text-sm">Hacer clic para cambiar imagen</span>
                                            </div>
                                        </div>

                                        {/* Botón opcional debajo para borrar la selección actual */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Evita que se abra el selector de archivos
                                                setArchivo(null);
                                                setPreviewUrl(null);
                                            }}
                                            className="mt-4 text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-tighter"
                                        >
                                            Eliminar y elegir otra
                                        </button>
                                    </div>
                                ) : (
                                    /* Vista de estado vacío (Instrucciones de subida) */
                                    <div
                                        className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                                        <div className={`
          w-20 h-20 rounded-[2rem] flex items-center justify-center mb-4 transition-all duration-300
          ${isDragging ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'}
        `}>
                                            <Upload size={32}/>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-slate-700 font-extrabold text-lg">
                                                {isDragging ? '¡Suelta la imagen ahora!' : 'Sube la foto de tu actividad'}
                                            </p>
                                            <p className="text-slate-400 text-sm">
                                                Arrastra el archivo aquí o haz clic para explorar
                                            </p>
                                        </div>

                                        <div className="mt-6 flex gap-2">
                                        <span
                                            className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase">JPG</span>
                                            <span
                                                className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase">PNG</span>
                                            <span
                                                className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase">WebP</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ============ ERROR + ACCIONES ============ */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-3 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 rounded-full text-secondary font-semibold text-sm hover:bg-white transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                        >
                            {loading ? "Creando..." : "Crear actividad"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}