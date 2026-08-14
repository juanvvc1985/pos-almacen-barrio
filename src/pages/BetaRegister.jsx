import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerBetaDueño } from "../services/betaAuth";
import { Store, Mail, Lock, User, Tag, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

export default function BetaRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    nombreAlmacen: "",
    codigoBeta: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Validaciones
    if (!form.nombre.trim()) { setError("El nombre es obligatorio"); return; }
    if (!form.email.trim() || !form.email.includes("@")) { setError("Ingresa un email válido"); return; }
    if (form.password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres"); return; }
    if (form.password !== form.confirmPassword) { setError("Las contraseñas no coinciden"); return; }
    if (!form.nombreAlmacen.trim()) { setError("El nombre de tu tienda es obligatorio"); return; }
    if (!form.codigoBeta.trim()) { setError("Ingresa tu código de invitación beta"); return; }

    setLoading(true);
    try {
      await registerBetaDueño({
        email: form.email,
        password: form.password,
        nombre: form.nombre,
        nombreAlmacen: form.nombreAlmacen,
        codigoBeta: form.codigoBeta,
      });
      setExito(true);
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      setError(err.message || "Error al registrar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (exito) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Registro exitoso!</h2>
          <p className="text-gray-600 mb-4">
            Tu cuenta y tienda han sido creadas. Tienes <strong>30 días de prueba</strong> con acceso completo.
          </p>
          <p className="text-sm text-gray-500">
            Después de los 30 días, tendrás <strong>6 meses del Plan Básico gratis</strong> como agradecimiento por ser beta tester.
          </p>
          <p className="text-xs text-gray-400 mt-4">Redirigiendo al dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Registro Beta</h1>
          <p className="text-gray-500 text-sm mt-1">
            Únete al programa beta de POS Almacén de Barrio
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tu nombre *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Juan Pérez"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="tu@email.com"
                />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Repite tu contraseña"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de tu tienda / almacén *</label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                name="nombreAlmacen"
                value={form.nombreAlmacen}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej: Almacén La Esquina"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código de invitación Beta *</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                name="codigoBeta"
                value={form.codigoBeta}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                placeholder="BETA-XXXX"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Solicita tu código al equipo de POS Almacén de Barrio
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-medium mb-1">¿Qué incluye tu registro beta?</p>
            <ul className="space-y-1 text-xs">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-green-600" />
                <strong>30 días</strong> de prueba con acceso completo
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-green-600" />
                Luego <strong>6 meses</strong> del Plan Básico gratis
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-green-600" />
                Después puedes elegir Plan Básico o Pro
              </li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 size={20} />}
            {loading ? "Creando cuenta..." : "Crear cuenta Beta"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1">
            <ArrowLeft size={14} /> Ya tengo cuenta, iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
