export function formatCurrency(value) {
  if (value === undefined || value === null) return "$0";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatShortDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function diasHastaVencimiento(fechaVencimiento) {
  if (!fechaVencimiento) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const venc = new Date(fechaVencimiento);
  venc.setHours(0, 0, 0, 0);
  const diff = Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24));
  return diff;
}

export function estadoVencimiento(fechaVencimiento, diasAlerta = 3) {
  const dias = diasHastaVencimiento(fechaVencimiento);
  if (dias === null) return null;
  if (dias < 0) return { estado: "vencido", label: "Vencido", color: "red" };
  if (dias <= diasAlerta) return { estado: "proximo", label: `Vence en ${dias} días`, color: "orange" };
  return { estado: "ok", label: `Vence en ${dias} días`, color: "green" };
}
