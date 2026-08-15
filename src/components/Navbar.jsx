import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { 
  LayoutDashboard, Package, Users, Tag, Trash2, 
  BarChart3, Settings, Key, LogOut, Menu, X, Store 
} from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isDueño, hasPrivilege, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper para clases activas
  const linkClass = (path) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      location.pathname === path || (path === '/app' && location.pathname === '/app/')
        ? "bg-slate-100 text-slate-900"
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
    }`;

  // Definición de menú con iconos elegantes
  const menuItems = [
    { path: "/app", label: "Vender", icon: LayoutDashboard, show: true },
    { path: "/app/productos", label: "Productos", icon: Package, show: isDueño || hasPrivilege("productos") },
    { path: "/app/fiados", label: "Fiados", icon: Users, show: true },
    { path: "/app/ofertas", label: "Ofertas", icon: Tag, show: isDueño || hasPrivilege("ofertas") },
    { path: "/app/mermas", label: "Mermas", icon: Trash2, show: isDueño || hasPrivilege("mermas") },
    { path: "/app/informes", label: "Informes", icon: BarChart3, show: true },
    { path: "/app/admin-beta", label: "Códigos Beta", icon: Key, show: isDueño },
    { path: "/app/vendedores", label: "Equipo", icon: Users, show: isDueño },
    { path: "/app/configuracion", label: "Ajustes", icon: Settings, show: isDueño },
  ];

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate("/app")}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center group-hover:bg-emerald-700 transition-colors">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight hidden sm:block">
              Loventa
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 bg-stone-50 p-1 rounded-xl border border-stone-100">
            {menuItems.filter(item => item.show).map(item => (
              <button 
                key={item.path} 
                onClick={() => navigate(item.path)} 
                className={linkClass(item.path)}
                title={item.label}
              >
                <item.icon size={18} />
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            ))}
          </div>

          {/* User & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-medium text-slate-700 leading-none">
                {user?.displayName || user?.email?.split('@')[0] || "Usuario"}
              </span>
              {isDueño && (
                <span className="text-[10px] text-emerald-600 font-medium mt-1 uppercase tracking-wider">
                  Dueño
                </span>
              )}
            </div>
            
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-slate-600 hover:bg-stone-100 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white animate-in slide-in-from-top-5">
          <div className="p-4 space-y-1">
            {menuItems.filter(item => item.show).map(item => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "bg-slate-50 text-slate-900"
                    : "text-slate-600 hover:bg-stone-50"
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}