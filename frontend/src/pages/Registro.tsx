// typescript
// Archivo: `frontend/src/pages/Registro.tsx`
import { useState, useEffect } from 'react';
import { register } from '../api/auth.api';
import { useNavigate} from "react-router-dom";
import { Link } from "react-router-dom";
import { Camera, Pencil, ArrowRight, CheckCircle2 } from "lucide-react";

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="text-[10px] font-bold tracking-[0.18em] text-neutral uppercase block mb-2">
                {label}
            </label>
            {children}
        </div>
    );
}

const Register = () => {
    const [form, setForm] = useState({
        nombreUsuario: '',
        nombre: '',
        apellidos: '',
        email: '',
        contrasena: '',
        fechaNac: '',
        sexo: false,
        biografia: '',
        ubicacion: '',
        imagen: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const [fotoFile, setFotoFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    // Maneja cambios en los campos del formulario
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const target = e.target as HTMLInputElement;
        const { name } = target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Limpiar object URLs
    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const validateForm = (form: {
        fechaNac: string;
    }): string | null => {
        const { fechaNac } = form;
        if (!fechaNac) return null;
        const dob = new Date(fechaNac);
        const now = new Date();
        if (dob > now) return 'La fecha de nacimiento no puede ser futura.';
        let age = now.getFullYear() - dob.getFullYear();
        const m = now.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
        if (age < 18) return 'Debes ser mayor de 18 años.';
        return null;
    };

    /*
    const checkUsernameExists = async (nombreUsuario: string): Promise<boolean> => {
        if (!nombreUsuario?.trim()) return false;
        try {
            const usuarios = await buscarUsuariosNombre(nombreUsuario);

            //si la lista tiene algun resultado
            if (usuarios.length > 0) {
                //recorre la lista comparando el usuarios.nombreUsuario con el nombreUsuario del form
                for (const usuario of usuarios) {
                    if (usuario.nombreUsuario === nombreUsuario) {
                        return true; // Si encuentra un match exacto, devuelve true
                    }
                }
            }
                return false; // Si no hay resultados, el nombre de usuario no existe



        } catch (err) {
            console.error('Error comprobando usuario:', err);
            return false;
        }
    };*/

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        //comprobar que la fecha de nacimiento no es futura y que el usuario es mayor de 18 años
        const validationError = validateForm(form);
        if (validationError) {
            setError(validationError);
            setLoading(false);
            return;
        }

        //Comprobar si existe un usario con el mismo nombre de usuario
      /*  const usernameExists = await checkUsernameExists(form.nombreUsuario);
        if (usernameExists) {
            setError('El nombre de usuario ya está en uso. Por favor elige otro.');
            setLoading(false);
            return;
        }*/


        try {
            if (fotoFile) {
                const formData = new FormData();
                // añade todos los campos del form (como strings)
                Object.entries(form).forEach(([key, value]) => {
                    formData.append(key, value as any);
                });
                formData.append('imagen', fotoFile);
                await register(formData); // register debe aceptar FormData en el backend
            } else {
                await register(form);
            }

            setSuccess('Usuario creado correctamente');
            navigate("/login");

        } catch (err:any) {
            console.error(err);

            const mensajeError = err.response?.data?.message || "Error al registrar";


            alert(mensajeError);

        } finally {
            setLoading(false);
        }
    };


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setFotoFile(file);
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
        } else {
            setPreview(null);
        }
    };




    return (
        <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-3xl shadow-xl overflow-hidden min-h-[700px]">
                <aside
                    className="relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden"
                    style={{
                        background:
                            "linear-gradient(135deg, #003C94 0%, #0056D2 50%, #1E40AF 100%)",
                    }}
                >
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage:
                                "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15), transparent 50%), radial-gradient(circle at 80% 70%, rgba(0,229,255,0.2), transparent 50%)",
                        }}
                    />
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage:
                                "repeating-linear-gradient(135deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 60px)",
                        }}
                    />

                    <div className="relative">
                        <div className="flex items-center gap-2 text-xl font-extrabold">
                            <CheckCircle2 className="w-6 h-6" />
                            <span style={{ fontFamily: "'Manrope', sans-serif" }}>
              Memora
            </span>
                        </div>

                        <h1
                            className="mt-16 text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight"
                            style={{ fontFamily: "'Manrope', sans-serif" }}
                        >
                            Diseña tu<br />
                            propio camino.
                        </h1>

                        <p className="mt-6 text-white/80 text-base leading-relaxed max-w-md">
                            Únete a una comunidad de pioneros. Crea tu perfil y desbloquea
                            networking exclusivo y acceso a eventos únicos.
                        </p>
                    </div>

                    <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-5 mt-8">
                        <p className="text-sm italic text-white/90 leading-relaxed">
                            "Publicar un plan aquí es tan fácil como vender una bici, pero en lugar de dinero, ganas experiencias. Creas el anuncio y la magia ocurre sola."
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                                LM
                            </div>
                            <div>
                                <div className="text-sm font-bold">Lucas Martín</div>
                                <div className="text-[10px] tracking-wider text-white/70 uppercase">
                                    Creador de comunidad
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                <main className="p-8 sm:p-12 overflow-y-auto">
                    <div className="flex items-end justify-between mb-8">
                        <h2
                            className="text-3xl sm:text-4xl font-extrabold text-secondary tracking-tight"
                            style={{ fontFamily: "'Manrope', sans-serif" }}
                        >
                            Crear cuenta
                        </h2>
                    </div>
                    <p className="-mt-6 mb-8 text-sm text-neutral">
                        ¿Ya tienes cuenta?{" "}
                        <Link
                            to="/login"
                            className="text-primary font-semibold hover:underline"
                        >
                            Inicia sesión
                        </Link>
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col items-center">

                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-neutral-light border-2 border-dashed border-primary/40 flex items-center justify-center overflow-hidden">
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt={form.nombreUsuario || 'Foto'}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Camera className="w-7 h-7 text-primary/70" />
                                    )}
                                </div>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                                    aria-label="Subir foto"
                                />

                                <button
                                    type="button"
                                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-600 transition shadow-md"
                                    aria-label="Editar foto"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <span className="mt-3 text-[10px] font-bold tracking-[0.18em] text-neutral uppercase">
              Foto de perfil
            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Field label="Nombre de usuario">
                                <input
                                    type="text"
                                    name="nombreUsuario"
                                    placeholder="@username"
                                    value={form.nombreUsuario}
                                    onChange={handleChange}
                                    required
                                    className="form-underline-input"
                                />
                            </Field>
                            <Field label="Ubicación">
                                <input
                                    type="text"
                                    name="ubicacion"
                                    placeholder="Tu ciudad"
                                    value={form.ubicacion}
                                    onChange={handleChange}
                                    className="form-underline-input"
                                />
                            </Field>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Field label="Nombre">
                                <input
                                    type="text"
                                    name="nombre"
                                    placeholder="Nombre"
                                    value={form.nombre}
                                    onChange={handleChange}
                                    required
                                    className="form-underline-input"
                                />
                            </Field>
                            <Field label="Apellidos">
                                <input
                                    type="text"
                                    name="apellidos"
                                    placeholder="Apellidos"
                                    value={form.apellidos}
                                    onChange={handleChange}
                                    required
                                    className="form-underline-input"
                                />
                            </Field>
                        </div>

                        <Field label="Correo electrónico">
                            <input
                                type="email"
                                name="email"
                                placeholder="ejemplo@correo.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="form-underline-input"
                            />
                        </Field>

                        <Field label="Contraseña">
                            <input
                                type="password"
                                name="contrasena"
                                placeholder="••••••••"
                                value={form.contrasena}
                                onChange={handleChange}
                                required
                                className="form-underline-input"
                            />
                        </Field>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Field label="Fecha de nacimiento">
                                <input
                                    type="date"
                                    name="fechaNac"
                                    value={form.fechaNac}
                                    onChange={handleChange}
                                    className="form-underline-input"
                                />
                            </Field>
                        </div>

                        <Field label="Biografía">
            <textarea
                name="biografia"
                placeholder="Cuéntanos sobre ti..."
                value={form.biografia}
                onChange={handleChange}
                rows={3}
                className="form-underline-input resize-none"
            />
                        </Field>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-full text-white font-bold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                            style={{
                                background:
                                    "linear-gradient(90deg, #0056D2 0%, #4f7cff 100%)",
                            }}
                        >
                            {loading ? "Creando..." : "Crear cuenta"}
                            {!loading && <ArrowRight className="w-4 h-4" />}
                        </button>

                        <p className="text-center text-[10px] tracking-wider text-neutral uppercase">
                            Al hacer click en crear cuenta aceptas nuestros{" "}
                            <a href="#" className="text-primary font-bold hover:underline">
                                términos
                            </a>{" "}
                            y{" "}
                            <a href="#" className="text-primary font-bold hover:underline">
                                política de privacidad
                            </a>
                            .
                        </p>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default Register;