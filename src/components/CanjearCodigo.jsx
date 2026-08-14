import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { validarCodigoBeta, usarCodigoBeta, activarProGratis } from "../services/paymentService";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";

export default function CanjearCodigo() {
  const { user, refreshUser } = useAuth();
  const [codigo, setCodigo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  async function handleCanjear(e) {
    e.preventDefault();
    if (!codigo.trim()) {
      setError("Ingresa un código beta.");
      return;
    }
    if (!user?.uid) {
      setError("Debes iniciar sesión para canjear un código.");
      return;
    }

    setCargando(true);
    setError("");
    setMensaje("");
    setExito(false);

    try {
      // 1. Validar código
      const validacion = await validarCodigoBeta(codigo);
      if (!validacion.valido) {
        setError(validacion.mensaje);
        setCargando(false);
        return;
      }

      // 2. Activar Pro Gratis en el usuario
      const dias = validacion.data.dias || 30;
      await activarProGratis(user.uid, dias);

      // 3. Marcar código como usado
      await usarCodigoBeta(codigo, user.uid);

      // 4. Actualizar metadata del usuario
      await updateDoc(doc(db, "usuarios", user.uid), {
        codigoBetaUsado: codigo.toUpperCase().trim(),
        planActivadoEn: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 5. Refrescar datos de usuario en el contexto
      await refreshUser();

      setExito(true);
      setMensaje(`🎉 ¡Plan Pro activado por ${dias} días! Disfruta de todas las funciones.`);
      setCodigo("");
    } catch (err) {
      setError("Error al canjear: " + err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎁</div>
          <h2 className="text-xl font-bold text-gray-800">Canjear Código Beta</h2>
          <p className="text-gray-500 text-sm mt-1">Activa tu plan Pro gratis</p>
        </div>

        {exito && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-center">
            {mensaje}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {!exito && (
          <form onSubmit={handleCanjear} className="space-y-4">
            <div>
              <label htmlFor="codigo-beta" className="block text-sm font-medium text-gray-700 mb-1">
                Código Beta
              </label>
              <input
                id="codigo-beta"
                name="codigoBeta"
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="Ej: ABC12345"
                maxLength={12}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-center font-mono text-lg tracking-widest uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cargando ? "Verificando..." : "🎁 Canjear Código"}
            </button>
          </form>
        )}

        <div className="mt-4 text-center text-xs text-gray-400">
          Los códigos beta son de un solo uso y tienen fecha de expiración.
        </div>
      </div>
    </div>
  );
}
