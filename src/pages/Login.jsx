import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { Store, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const { login, registerDueño, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modo, setModo] = useState("login");
  const [nombre, setNombre] = useState("");
  const [nombreNegocio, setNombreNegocio] = useState("");
  const [cargando, setCargando] = useState(false);
  const [errorLocal, setErrorLocal] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Si ya hay sesión activa (ej: volviste con sesión guardada), entra directo al panel
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/app", { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorLocal("");
    setCargando(true);
    try {
      if (modo === "login") {
        await login(email, password);
      } else {
        await registerDueño(email, password, nombre, nombreNegocio);
      }
      navigate("/app", { replace: true });
    } catch (err) {
      setErrorLocal(err.message || "Error al iniciar sesión");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <Store className="w-5 h-5 text-sky-400" />
            </div>
            <span className="text-xl font-bold text-slate-900">
              Loventa<span className="text-sky-500">.</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">
            {modo === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Almacén de Barrio — POS</p>
        </div>

        {errorLocal && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {errorLocal}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {modo === "registro" && (
            <>
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-1">
                  Tu nombre
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  autoComplete="name"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label htmlFor="nombreNegocio" className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre del negocio
                </label>
                <input
                  id="nombreNegocio"
                  name="nombreNegocio"
                  type="text"
                  autoComplete="organization"
                  required
                  value={nombreNegocio}
                  onChange={(e) => setNombreNegocio(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                  placeholder="Mi Almacén"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Correo o usuario
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={modo === "login" ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-lg pl-10 pr-10 py-2.5 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {cargando ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight size={18} />}
            {cargando ? "Cargando..." : modo === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setModo(modo === "login" ? "registro" : "login");
              setErrorLocal("");
            }}
            className="text-sky-600 hover:text-sky-700 text-sm font-medium"
          >
            {modo === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200 text-center">
          <Link to="/" className="text-xs text-slate-400 hover:text-slate-600">
            ← Volver a la página principal
          </Link>
        </div>
      </div>
    </div>
  );
}