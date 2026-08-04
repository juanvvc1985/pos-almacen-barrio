import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getPlan, contarProductos, contarVendedores, LIMITES } from "../services/planLimits";
import { Crown, Package, Users } from "lucide-react";

export default function PlanBadge() {
  const { almacenId, isDueño } = useAuth();
  const [plan, setPlan] = useState("basico");
  const [stats, setStats] = useState({ productos: 0, vendedores: 0 });

  useEffect(() => {
    if (!almacenId || !isDueño) return;
    let mounted = true;
    async function cargar() {
      const p = await getPlan(almacenId);
      const prod = await contarProductos(almacenId);
      const ven = await contarVendedores(almacenId);
      if (mounted) {
        setPlan(p);
        setStats({ productos: prod, vendedores: ven });
      }
    }
    cargar();
    return () => { mounted = false; };
  }, [almacenId, isDueño]);

  if (!isDueño) return null;

  const esPro = plan === "pro";
  const limProd = LIMITES[plan]?.productos ?? 500;
  const limVen = LIMITES[plan]?.vendedores ?? 1;

  return (
    <div className={`flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs font-medium border ${
      esPro ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-gray-50 border-gray-200 text-gray-600"
    }`}>
      <Crown size={14} className={esPro ? "text-purple-600" : "text-gray-400"} />
      <span className="uppercase tracking-wide">{plan}</span>
      <span className="hidden sm:inline text-gray-300">|</span>
      <span className="hidden sm:flex items-center gap-1">
        <Package size={12} /> {stats.productos}/{limProd === Infinity ? "∞" : limProd}
      </span>
      <span className="hidden sm:flex items-center gap-1">
        <Users size={12} /> {stats.vendedores}/{limVen === Infinity ? "∞" : limVen}
      </span>
    </div>
  );
}
