import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import {
  Store, Mail, Lock, Loader2, ArrowRight, ShieldCheck,
  WifiOff, Smartphone, Eye, EyeOff
} from "lucide-react";

export default function Login() {
  const { login, registerDueño, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modo, setModo] = useState("login");
  const [nombre, setNombre] = useState("");
  const [nombreNegocio, setNombreNegocio] = useState("");
  const [cargando, setCargando] = useState(false);
  const [errorLocal, setErrorLocal] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Si ya hay sesión activa, ir directo al panel
  useEffect(() => {
    if (!loading && user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

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
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Error de autenticación:", err);
      setErrorLocal(err.message || "Error al iniciar sesión. Verifica tus datos.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-100 font-sans">
      {/* ─── PANEL IZQUIERDO (BRANDING) ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        <div className="absolute top-0 left-0 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-20 w-full max-w-2xl mx-auto">
          <Link to="/" className="flex items-center gap-3 mb-14 w-fit">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
              <Store className="w-5 h-5 text-sky-400" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Loventa<span className="text-sky-400">.</span>
            </span>
          </Link>

          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6">
            Tu almacén ordenado.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
              Sin cuaderno ni calculadora.
            </span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed mb-10">
            Vende sin internet. Controla tu stock. Registra fiados.
            Todo desde tu celular.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center shrink-0">
                <WifiOff className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <p className="font-semibold text-white">100% Offline First</p>
                <p className="text-sm text-slate-400">Sigue vendiendo aunque se caiga el internet.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-white">Tu celular es tu caja</p>
                <p className="text-sm text-slate-400">Sin hardware costoso. Solo tú y tu teléfono.</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500 flex items-center gap-2 mt-10">
            <ShieldCheck className="w-4 h-4" />
            Datos encriptados y seguros en la nube de Google.
          </p>
        </div>
      </div>

      {/* ─── PANEL DERECHO (FORMULARIO) ─── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Logo móvil */}
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8 w-fit">
            <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center">
              <Store className="w-4 h-4 text-sky-400" />
            </div>
            <span className="text-xl font-bold text-slate-900">
              Loventa<span className="text-sky-600">.</span>
            </span>
          </Link>

          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            {modo === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
          </h2>
          <p className="text-slate-500 mb-8">
            {modo === "login"
              ? "Ingresa tus credenciales para acceder al panel."
              : "Registra tu negocio y comienza a vender hoy."}
          </p>

          {errorLocal && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
              {errorLocal}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {modo === "registro" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-1.5">Tu nombre</label>
                  <input
                    id="nombre" name="nombre" type="text" autoComplete="name" required
                    value={nombre} onChange={(e) => setNombre(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition bg-white"
                    placeholder="Juan Pérez"
                  />
                </div>
                <div>
                  <label htmlFor="nombreNegocio" className="block text-sm font-medium text-slate-700 mb-1.5">Negocio</label>
                  <input
                    id="nombreNegocio" name="nombreNegocio" type="text" autoComplete="organization" required
                    value={nombreNegocio} onChange={(e) => setNombreNegocio(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition bg-white"
                    placeholder="Mi Almacén"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Correo o usuario</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="email" name="email" type="text" autoComplete="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition bg-white"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">Contraseña</label>
                {modo === "login" && (
                  <button type="button" className="text-xs font-medium text-sky-600 hover:text-sky-700">
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="password" name="password" type={showPassword ? "text" : "password"}
                  autoComplete={modo === "login" ? "current-password" : "new-password"} required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl pl-11 pr-12 py-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition bg-white"
                  placeholder="••••••••"
                />
                <button
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={cargando}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
            >
              {cargando ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight size={18} />}
              {cargando ? "Procesando..." : modo === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            {modo === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
            <button
              type="button"
              onClick={() => { setModo(modo === "login" ? "registro" : "login"); setErrorLocal(""); }}
              className="font-semibold text-sky-600 hover:text-sky-700"
            >
              {modo === "login" ? "Regístrate gratis" : "Inicia sesión"}
            </button>
          </p>

          <div className="relative flex items-center py-6">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs text-slate-400 uppercase tracking-wider font-medium">O continúa con</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <button className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-300 rounded-xl bg-white hover:bg-slate-50 transition text-sm font-medium text-slate-700">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.97 10.97 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google (Próximamente)
          </button>

          <p className="text-center text-xs text-slate-400 mt-6">
            Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad.
          </p>
        </div>
      </div>
    </div>
  );
}