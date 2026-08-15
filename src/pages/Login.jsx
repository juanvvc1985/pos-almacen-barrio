import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { 
  Store, Mail, Lock, Loader2, ArrowRight, ShieldCheck, 
  WifiOff, Smartphone, Zap, ChevronRight, Eye, EyeOff 
} from "lucide-react";

export default function Login() {
  const { login, registerDueño, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modo, setModo] = useState("login");
  const [nombre, setNombre] = useState("");
  const [nombreNegocio, setNombreNegocio] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Redirección automática si ya está logueado
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/app", { replace: true });
    }
  }, [user, authLoading, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      if (modo === "login") {
        await login(email, password);
      } else {
        await registerDueño(email, password, nombre, nombreNegocio);
      }
      // La redirección la maneja el useEffect de arriba
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al procesar. Verifica tus datos.");
    } finally {
      setCargando(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Cargando Loventa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* ─── LADO IZQUIERDO: BRANDING (Oculto en móvil) ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        {/* Fondo decorativo abstracto */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Patrón de grid sutil */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full max-w-2xl mx-auto">
          <div>
            <Link to="/" className="flex items-center gap-3 group mb-16">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 group-hover:bg-emerald-500/20 transition-colors">
                <Store className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                Loventa<span className="text-emerald-400">.</span>
              </span>
            </Link>

            <h1 className="text-5xl font-extrabold leading-tight mb-6">
              El POS que tu almacén <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
                realmente necesita.
              </span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed max-w-md">
              Vende sin internet. Controla tu stock. Registra fiados. 
              Todo desde tu celular, con un diseño que inspira confianza.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <WifiOff className="w-5 h-5 text-emerald-400" />
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

            <div className="pt-8 border-t border-white/10">
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Datos encriptados y seguros en la nube de Google.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── LADO DERECHO: FORMULARIO ─── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          
          {/* Header Móvil (Solo visible en pantallas pequeñas) */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <Store className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-xl font-bold text-slate-900">Loventa</span>
            </Link>
            <h2 className="text-2xl font-bold text-slate-900">Bienvenido de vuelta</h2>
            <p className="text-slate-500 mt-2">Ingresa a tu cuenta para continuar</p>
          </div>

          {/* Header Desktop */}
          <div className="hidden lg:block">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {modo === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
            </h2>
            <p className="text-slate-500 mt-2">
              {modo === "login" 
                ? "Ingresa tus credenciales para acceder al panel." 
                : "Registra tu negocio y comienza a vender hoy."}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3 animate-in slide-in-from-top-2">
              <div className="text-red-500 mt-0.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error de autenticación</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {modo === "registro" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="space-y-1.5">
                  <label htmlFor="nombre" className="text-sm font-medium text-slate-700 ml-1">Tu nombre</label>
                  <input
                    id="nombre"
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="Juan Pérez"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="nombreNegocio" className="text-sm font-medium text-slate-700 ml-1">Nombre del negocio</label>
                  <input
                    id="nombreNegocio"
                    type="text"
                    required
                    value={nombreNegocio}
                    onChange={(e) => setNombreNegocio(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
                    placeholder="Mi Almacén"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700 ml-1">Correo electrónico</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">Contraseña</label>
                {modo === "login" && (
                  <button type="button" className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={modo === "login" ? "current-password" : "new-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group"
            >
              {cargando ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  {modo === "login" ? "Iniciar Sesión" : "Crear Cuenta Gratis"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-sm text-slate-500">
              {modo === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setModo(modo === "login" ? "registro" : "login");
                  setError("");
                }}
                className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                {modo === "login" ? "Regístrate gratis" : "Inicia sesión"}
              </button>
            </p>
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs text-slate-400 uppercase tracking-wider font-medium">O continúa con</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="grid grid-cols-1 gap-3">
             <button className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Google (Próximamente)
             </button>
          </div>
          
          <p className="text-center text-xs text-slate-400 mt-8">
            Al continuar, aceptas nuestros <Link to="#" className="underline hover:text-slate-600">Términos de Servicio</Link> y <Link to="#" className="underline hover:text-slate-600">Política de Privacidad</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}