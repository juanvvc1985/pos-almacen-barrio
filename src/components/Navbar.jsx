import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Store, LogOut, Menu, X, LayoutGrid, Package, Users, Tag,
  Trash2, BarChart3, KeyRound, Settings,
} from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isDueño, hasPrivilege, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = (path) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
      location.pathname === path
        ? "bg-sky-100 text-sky-700"
        : "text-slate-600 hover:bg-slate-100"
    }`;

  const menuItems = [
    { path: "/app", label: "Vender", icon: LayoutGrid, show: true },
    { path: "/app/productos", label: "Productos", icon: Package, show: isDueño || hasPrivilege("productos") },
    { path: "/app/fiados", label: "Fiados", icon: Users, show: true },
    { path: "/app/ofertas", label: "Ofertas", icon: Tag, show: isDueño || hasPrivilege("ofertas") },
    { path: "/app/mermas", label: "Mermas", icon: Trash2, show: isDueño || hasPrivilege("mermas") },
    { path: "/app/informes", label: "Informes", icon: BarChart3, show: true },
    { path: "/app/admin-beta", label: "Códigos Beta", icon: KeyRound, show: isDueño },
    { path: "/app/vendedores", label: "Equipo", icon: Users, show: isDueño },
    { path: "/app/configuracion", label: "Ajustes", icon: Settings, show: isDueño },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-14">
          {/* Logo → vuelve a la página principal pública */}
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Store className="w-4 h-4 text-sky-400" />
            </div>
            <span className="font-bold text-lg text-slate-900">Loventa</span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {menuItems.filter((item) => item.show).map((item) => (
              <button key={item.path} onClick={() => navigate(item.path)} className={linkClass(item.path)}>
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 hidden sm:block">
              {user?.displayName || user?.email || "Usuario"}
              {isDueño && <span className="ml-1 text-xs bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded">Dueño</span>}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition"
            >
              <LogOut size={16} /> Salir
            </button>
            <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {menuItems.filter((item) => item.show).map((item) => (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                location.pathname === item.path ? "bg-sky-100 text-sky-700" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}