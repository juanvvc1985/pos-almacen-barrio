import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { Store, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";

export default function Login() {
  const { login, registerDueño, error: authError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modo, setModo] = useState("login");
  const [nombre, setNombre] = useState("");
  const [nombreNegocio, setNombreNegocio] = useState("");
  const [cargando, setCargando] = useState(false);
  const [errorLocal, setErrorLocal] = useState("");

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
      navigate("/app"); // Redirigir al dashboard interno
    } catch (err) {
      setErrorLocal(err.message || "Error al iniciar sesión");
    } finally {
      setCargando(false);
    }
  }

  const error = errorLocal || authError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-stone-200/50 p-8 border border-stone-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {modo === "login" ? "Bienvenido de vuelta" : "Crear Cuenta"}
          </h1>
          <p className="text-slate-500 text-sm mt-2">Almacén de Barrio — POS</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-2">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {modo === "registro" && (
            <>
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-1.5">
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
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-stone-50/50"
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label htmlFor="nombreNegocio" className="block text-sm font-medium text-slate-700 mb-1.5">
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
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-stone-50/50"
                  placeholder="Mi Almacén"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-stone-50/50"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={modo === "login" ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-stone-50/50"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
          >
            {cargando ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {cargando ? "Procesando..." : modo === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setModo(modo === "login" ? "registro" : "login");
              setErrorLocal("");
            }}
            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition"
          >
            {modo === "login"
              ? "¿No tienes cuenta? Regístrate"
              : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
        </div>
        
        {modo === "login" && (
          <div className="mt-4 pt-4 border-t border-stone-100 text-center">
             <Link to="/" className="text-xs text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1">
               <ArrowLeft size={12} /> Volver al inicio
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}