export const UNIDADES = ["unidad", "kg", "g", "l", "ml", "m", "cm"];

export const CATEGORIAS = [
  "Abarrotes",
  "Bebidas",
  "Lácteos",
  "Carnes",
  "Frutas",
  "Verduras",
  "Panadería",
  "Limpieza",
  "Higiene",
  "Otros",
];

export const METODOS_PAGO = [
  { value: "efectivo", label: "Efectivo", color: "green" },
  { value: "tarjeta", label: "Tarjeta", color: "blue" },
  { value: "transferencia", label: "Transferencia", color: "purple" },
  { value: "fiado", label: "Fiado", color: "orange" },
];

export const MOTIVOS_MERMA = [
  "Vencido",
  "Dañado",
  "Roto",
  "Robado",
  "Descomposición",
  "Embalaje defectuoso",
  "Otro",
];

export const ESTADOS_DEUDA = {
  PENDIENTE: "pendiente",
  PARCIAL: "parcial",
  PAGADA: "pagada",
  ATRASADA: "atrasada",
};

export const ROLES = {
  DUEÑO: "dueño",
  VENDEDOR: "vendedor",
};

export const PLANES = {
  BASICO: "basico",
  PRO: "pro",
};

export const DIAS_ALERTA_VENCIMIENTO = [1, 3, 5, 7, 10, 14, 30];
