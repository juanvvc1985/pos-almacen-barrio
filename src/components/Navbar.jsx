import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { 
  ShoppingCart, Package, BarChart3, AlertTriangle, 
  Users, Tag, LogOut, Menu, X, UserPlus 
} from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { isDueño, isVendedor, userData, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/vender", label: "Vender", icon: ShoppingCart, show: true },
    { path: "/productos", label: "Productos", icon: Package, show: true },
    { path: "/fiados", label: "Fiados", icon: Users, show: true },  // Vendedor también ve fiados
    { path: "/ofertas", label: "Ofertas", icon: Tag, show: isDueño },
    { path: "/mermas", label: "Mermas", icon: AlertTriangle, show: isDueño },
    { path: "/informes", label: "Informes", icon: BarChart3, show: isDueño },
    { path: "/vendedores", label: "Vendedores", icon: UserPlus, show: isDueño },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="font-bold text-xl text-blue-600">POS Almacén</Link>
          <div className="hidden md:flex items-center space-x-1">
            {navItems.filter(i => i.show).map((item) => (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive(item.path) ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}>
                <item.icon size={18} /> {item.label}
              </Link>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {userData?.nombre} • {isDueño ? "Dueño" : "Vendedor"}
            </span>
            <button onClick={logout}
              className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition text-sm">
              <LogOut size={18} /> Salir
            </button>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-2 space-y-1">
            {navItems.filter(i => i.show).map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${
                  isActive(item.path) ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                }`}>
                <item.icon size={18} /> {item.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 pt-2 mt-2">
              <div className="px-3 py-2 text-sm text-gray-500">
                {userData?.nombre} • {isDueño ? "Dueño" : "Vendedor"}
              </div>
              <button onClick={() => { logout(); setMenuOpen(false); }}
                className="flex items-center gap-3 px-3 py-3 text-red-600 text-sm font-medium w-full">
                <LogOut size={18} /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
