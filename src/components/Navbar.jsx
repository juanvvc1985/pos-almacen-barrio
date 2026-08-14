import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isDueño, logout } = useAuth();

  const linkClass = (path) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition ${
      location.pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 font-bold text-lg text-blue-600"
          >
            🏪 Almacén de Barrio
          </button>

          {/* Links principales */}
          <div className="hidden md:flex items-center gap-1">
            <button onClick={() => navigate("/vender")} className={linkClass("/vender")}>
              🛒 Vender
            </button>
            <button onClick={() => navigate("/productos")} className={linkClass("/productos")}>
              📦 Productos
            </button>
            <button onClick={() => navigate("/fiados")} className={linkClass("/fiados")}>
              📝 Fiados
            </button>
            <button onClick={() => navigate("/ofertas")} className={linkClass("/ofertas")}>
              🏷️ Ofertas
            </button>
            <button onClick={() => navigate("/mermas")} className={linkClass("/mermas")}>
              🗑️ Mermas
            </button>
            <button onClick={() => navigate("/informes")} className={linkClass("/informes")}>
              📊 Informes
            </button>

            {/* 🔑 Botón Códigos Beta — solo para dueños */}
            {isDueño && (
              <button
                onClick={() => navigate("/admin-beta")}
                className={linkClass("/admin-beta")}
              >
                🔑 Códigos Beta
              </button>
            )}

            {isDueño && (
              <button onClick={() => navigate("/vendedores")} className={linkClass("/vendedores")}>
                👥 Vendedores
              </button>
            )}
            {isDueño && (
              <button onClick={() => navigate("/configuracion")} className={linkClass("/configuracion")}>
                ⚙️ Config
              </button>
            )}
          </div>

          {/* Usuario + Logout */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden sm:block">
              {user?.nombre || user?.email || "Invitado"}
              {isDueño && <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Dueño</span>}
            </span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-800 font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
