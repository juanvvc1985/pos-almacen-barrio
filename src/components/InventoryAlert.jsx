import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { productsService } from "../services/firestoreProducts";
import { AlertTriangle, X } from "lucide-react";
import { diasHastaVencimiento } from "../utils/format";

export default function InventoryAlert() {
  const { almacenId } = useAuth();
  const [alertas, setAlertas] = useState([]);
  const [cerradas, setCerradas] = useState(() => {
    return JSON.parse(localStorage.getItem("alertas_cerradas") || "[]");
  });

  useEffect(() => {
    if (!almacenId) return;
    cargarAlertas();
  }, [almacenId]);

  async function cargarAlertas() {
    const productos = await productsService.getProducts(almacenId);
    const alertasList = [];

    productos.forEach((p) => {
      // Stock crítico
      if (p.stockCritico && p.stockActual<= p.stockCritico && p.stockActual> 0) {
        alertasList.push({
          id: `stock-${p.id}`,
          tipo: "stock",
          mensaje: `${p.nombre}: Stock bajo (${p.stockActual} ${p.unidad})`,
          producto: p,
        });
      }
      if (p.stockActual=== 0) {
        alertasList.push({
          id: `sin-stock-${p.id}`,
          tipo: "sin-stock",
          mensaje: `${p.nombre}: Sin stock`,
          producto: p,
        });
      }

      // Vencimientos
      if (p.perecedero && p.lotes) {
        p.lotes.forEach((lote) => {
          const dias = diasHastaVencimiento(lote.fechaVencimiento);
          if (dias !== null && dias <= (p.diasAlertaVencimiento || 3) && dias >= 0) {
            alertasList.push({
              id: `venc-${p.id}-${lote.id}`,
              tipo: "vencimiento",
              mensaje: `${p.nombre}: Vence en ${dias} días`,
              producto: p,
            });
          }
          if (dias !== null && dias < 0) {
            alertasList.push({
              id: `vencido-${p.id}-${lote.id}`,
              tipo: "vencido",
              mensaje: `${p.nombre}: Producto vencido`,
              producto: p,
            });
          }
        });
      }
    });

    setAlertas(alertasList);
  }

  function cerrarAlerta(id) {
    const nuevas = [...cerradas, id];
    setCerradas(nuevas);
    localStorage.setItem("alertas_cerradas", JSON.stringify(nuevas));
  }

  const alertasVisibles = alertas.filter((a) => !cerradas.includes(a.id));
  if (alertasVisibles.length === 0) return null;

  return (
    <div className="space-y-2 mb-4">
      {alertasVisibles.map((alerta) => (
        <div
          key={alerta.id}
          className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm ${
            alerta.tipo === "vencido"
              ? "bg-red-50 border border-red-200 text-red-700"
              : alerta.tipo === "sin-stock"
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-orange-50 border border-orange-200 text-orange-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{alerta.mensaje}</span>
          </div>
          <button
            onClick={() => cerrarAlerta(alerta.id)}
            className="p-1 hover:bg-black/5 rounded transition"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
