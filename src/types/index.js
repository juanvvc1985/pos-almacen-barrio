export const UNIDADES = ["unidad", "kg", "g", "l", "ml", "m", "cm"];

export const CATEGORIAS = [
  "Abarrotes", "Lácteos", "Bebidas", "Panadería", "Confitería",
  "Limpieza", "Frutas/Verduras", "Hogar"
];

export const METODOS_PAGO = [
  { value: "efectivo", label: "Efectivo", color: "green" },
  { value: "tarjeta", label: "Tarjeta", color: "blue" },
  { value: "transferencia", label: "Transferencia", color: "purple" },
  { value: "fiado", label: "Fiado", color: "orange" },
];

export const MOTIVOS_MERMA = [
  "Vencido",
  "Dañado por humedad/descomposición",
  "Embalaje roto/desgastado",
  "Producto roto",
  "Robado",
  "Otro",
];

export const ESTADOS_DEUDA = ["pendiente", "parcial", "pagada"];

export const ROLES = ["dueño", "vendedor"];

export const DIAS_ALERTA_VENCIMIENTO = [1, 2, 3, 5, 7, 14, 30];

// NUEVO v5.0: Criterios configurables para Mermas y Ofertas
export const CRITERIOS_MERMA = [
  "Vencido",
  "Dañado por humedad/descomposición",
  "Embalaje roto/desgastado",
  "Producto roto",
  "Robado",
  "Otro",
];

export const CRITERIOS_OFERTA = [
  "Por vencer",
  "Embalaje dañado",
  "Daño menor / deterioro estético",
  "Sobrestock",
  "Otro",
];

export const DIAS_POR_VENCER_DEFAULT = 7;
