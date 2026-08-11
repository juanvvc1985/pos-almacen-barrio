import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, sendPasswordReset } from "../hooks/useAuth";
import { Store, Eye, EyeOff, Loader2, Mail, WifiOff } from "lucide-react";

const MAX_EMAIL_LEN = 100;
const MAX_PASSWORD_LEN = 50;
const MAX_USERNAME_LEN = 30;

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false);
  const [emailRecuperar, setEmailRecuperar] = useState("");
  const [recuperando, setRecuperando] = useState(false);
  const [mensajeRecuperar, setMensajeRecuperar] = useState("");
  const [nombreNegocio, setNombreNegocio] = useState("Tu Negocio");
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("pos_negocio_nombre");
    if (saved) setNombreNegocio(saved);
  }, []);

  function sanitizeInput(value, maxLen) {
    return value.slice(0, maxLen).replace(/[<>'"&]/g, "");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanIdentifier = sanitizeInput(identifier, identifier.includes("@") ? MAX_EMAIL_LEN : MAX_USERNAME_LEN);
    const cleanPassword = sanitizeInput(password, MAX_PASSWORD_LEN);

    if (!cleanIdentifier.trim()) {
      setError("Ingresa tu usuario o correo");
      return;
    }
    if (cleanPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      await login(cleanIdentifier, cleanPassword);
      navigate("/");
    } catch (err) {
      let msg = "Error al iniciar sesión";

      // Errores offline específicos
      if (err.message?.includes("Sin conexión")) {
        msg = err.message;
      } else if (err.message === "Usuario no encontrado") {
        msg = "Usuario no encontrado";
      } else if (err.code === "auth/user-not-found") {
        msg = "Usuario no encontrado";
      } else if (err.code === "auth/wrong-password") {
        msg = "Contraseña incorrecta";
      } else if (err.code === "auth/invalid-credential") {
        msg = "Usuario o contraseña incorrectos";
      } else if (err.code === "auth/invalid-email") {
        msg = "Formato de usuario/correo inválido";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Demasiados intentos. Intenta más tarde.";
      } else if (err.code === "auth/network-request-failed") {
        msg = "Sin conexión a internet. Si ya iniciaste sesión antes en este dispositivo, inténtalo de nuevo. Si es la primera vez, necesitas internet.";
      } else if (err.message) {
        // Mostrar mensaje original si no coincide con los anteriores
        msg = err.message;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  async function handleRecuperar(e) {
    e.preventDefault();
    setMensajeRecuperar("");
    const email = sanitizeInput(emailRecuperar, MAX_EMAIL_LEN);
    if (!email.includes("@")) {
      setMensajeRecuperar("Ingresa un correo válido");
      return;
    }
    setRecuperando(true);
    try {
      await sendPasswordReset(email);
      setMensajeRecuperar("Te enviamos un correo para recuperar tu contraseña. Revisa tu bandeja de entrada.");
      setEmailRecuperar("");
    } catch (err) {
      let msg = "Error al enviar correo";
      if (err.code === "auth/user-not-found") msg = "No existe una cuenta con ese correo";
      setMensajeRecuperar(msg);
    } finally {
      setRecuperando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{nombreNegocio}</h1>
          <p className="text-gray-500 mt-1">Inicia sesión en tu cuenta</p>
        </div>

        {!navigator.onLine && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
            <WifiOff size={16} />
            <span>Sin internet. Si es la primera vez en este dispositivo, necesitas conectarte una vez para guardar la sesión.</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {!mostrarRecuperar ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario o Correo electrónico
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(sanitizeInput(e.target.value, MAX_EMAIL_LEN))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="juan o juan@email.com"
                maxLength={MAX_EMAIL_LEN}
                autoComplete="username"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Vendedores: usa tu nombre de usuario. Dueños: usa tu correo.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(sanitizeInput(e.target.value, MAX_PASSWORD_LEN))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition pr-10"
                  placeholder="••••••••"
                  maxLength={MAX_PASSWORD_LEN}
                  minLength={6}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Iniciar Sesión"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setMostrarRecuperar(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRecuperar} className="space-y-4">
            <div className="text-center mb-4">
              <Mail className="w-10 h-10 text-blue-600 mx-auto mb-2" />
              <h2 className="text-lg font-bold text-gray-800">Recuperar contraseña</h2>
              <p className="text-sm text-gray-500">Ingresa tu correo de dueño y te enviaremos un enlace</p>
            </div>

            {mensajeRecuperar && (
              <div className={`border px-4 py-3 rounded-lg text-sm ${mensajeRecuperar.includes("enviamos") ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                {mensajeRecuperar}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
              <input
                type="email"
                value={emailRecuperar}
                onChange={(e) => setEmailRecuperar(sanitizeInput(e.target.value, MAX_EMAIL_LEN))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="tu@email.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={recuperando}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {recuperando ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enviar correo de recuperación"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setMostrarRecuperar(false); setMensajeRecuperar(""); }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Volver al login
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes cuenta de dueño?{" "}
            <Link to="/registro" className="text-blue-600 hover:text-blue-700 font-medium">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
