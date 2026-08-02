import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Store, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";

const MAX_LEN = 100;
const MAX_PASS = 50;

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nombreAlmacen, setNombreAlmacen] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { registerDueño } = useAuth();
  const navigate = useNavigate();

  function sanitize(value, max) {
    return value.slice(0, max).replace(/[<>"'&]/g, "");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanNombre = sanitize(nombre, MAX_LEN);
    const cleanEmail = sanitize(email, MAX_LEN);
    const cleanPass = sanitize(password, MAX_PASS);
    const cleanAlmacen = sanitize(nombreAlmacen, MAX_LEN);

    if (cleanPass.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (cleanPass !== sanitize(confirmPassword, MAX_PASS)) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setError("Ingresa un correo válido");
      return;
    }

    setLoading(true);
    try {
      await registerDueño(cleanEmail, cleanPass, cleanNombre, cleanAlmacen);
      navigate("/");
    } catch (err) {
      let msg = "Error al registrar";
      if (err.code === "auth/email-already-in-use") msg = "Este email ya está registrado";
      else if (err.code === "auth/invalid-email") msg = "Email inválido";
      else if (err.code === "auth/weak-password") msg = "Contraseña muy débil";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="mb-6">
          <Link to="/login" className="inline-flex items-center text-gray-500 hover:text-gray-700 text-sm">
            <ArrowLeft size={16} className="mr-1" /> Volver al login
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Crear Cuenta de Dueño</h1>
          <p className="text-gray-500 mt-1">Registra tu almacén y comienza a vender</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tu nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(sanitize(e.target.value, MAX_LEN))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Juan Pérez"
              maxLength={MAX_LEN}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del almacén</label>
            <input
              type="text"
              value={nombreAlmacen}
              onChange={(e) => setNombreAlmacen(sanitize(e.target.value, MAX_LEN))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Almacén La Esquina"
              maxLength={MAX_LEN}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(sanitize(e.target.value, MAX_LEN))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="tu@email.com"
              maxLength={MAX_LEN}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(sanitize(e.target.value, MAX_PASS))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none pr-10"
                placeholder="Mínimo 6 caracteres"
                maxLength={MAX_PASS}
                minLength={6}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(sanitize(e.target.value, MAX_PASS))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Repite tu contraseña"
              maxLength={MAX_PASS}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Crear Cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
