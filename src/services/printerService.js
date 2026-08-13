// printerService.js
// Impresión de tickets en impresoras térmicas de 58mm/80mm vía Bluetooth (BLE),
// usando la Web Bluetooth API del navegador y comandos ESC/POS crudos.
//
// LIMITACIONES IMPORTANTES (léelas antes de reportar un bug):
// 1. Web Bluetooth SOLO funciona en Chrome/Edge para Android y en Chrome/Edge
//    de escritorio. Safari de iPhone/iPad NO lo soporta (Apple lo bloquea en
//    WebKit) y por lo tanto esta función NO puede imprimir desde un iPhone,
//    sea con Safari o con la app instalada como PWA. Es una limitación del
//    navegador, no de este código.
// 2. Solo funciona con impresoras que soportan Bluetooth LOW ENERGY (BLE).
//    Muchas impresoras térmicas chinas baratas usan Bluetooth Clásico (SPP),
//    que el navegador no puede usar. Si al presionar "Emparejar impresora" no
//    aparece tu impresora en la lista, probablemente sea Bluetooth Clásico y
//    esta función no podrá usarla (se necesitaría una app nativa, no una web).
// 3. La primera vez que se imprime en cada sesión del navegador, Chrome pedirá
//    elegir el dispositivo Bluetooth (esto lo exige el navegador por seguridad,
//    no se puede omitir). Mientras la pestaña/app siga abierta, no debería
//    volver a pedirlo.

// UUIDs de servicio/característica más comunes en impresoras térmicas BLE
// genéricas (módulos tipo "BT" usados por marcas como Goojprt, MPT-II, POS58,
// Rongta, y varios clones sin marca que se venden en Chile). Si tu impresora
// no conecta con estos, prueba el modo "auto-detectar" que revisa todos los
// servicios del dispositivo buscando una característica que acepte escritura.
const SERVICE_UUID_CANDIDATES = [
  "000018f0-0000-1000-8000-00805f9b34fb",
  "49535343-fe7d-4ae5-8fa9-9fafd205e455",
  "e7810a71-73ae-499d-8c15-faa9aef0c3f2",
];

const STORAGE_KEY = "pos_printer_config";

let cachedDevice = null;
let cachedCharacteristic = null;

export function getPrinterConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { habilitada: false, nombreDispositivo: null };
  } catch {
    return { habilitada: false, nombreDispositivo: null };
  }
}

export function setPrinterConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function isWebBluetoothSupported() {
  return typeof navigator !== "undefined" && !!navigator.bluetooth;
}

export function isConnected() {
  return !!(cachedDevice && cachedDevice.gatt && cachedDevice.gatt.connected);
}

// Busca, entre TODOS los servicios/características del dispositivo, la primera
// característica que acepte escritura. Sirve como respaldo cuando la
// impresora no usa ninguno de los UUIDs conocidos de arriba.
async function encontrarCaracteristicaEscritura(server) {
  const services = await server.getPrimaryServices();
  for (const service of services) {
    const chars = await service.getCharacteristics();
    const writable = chars.find((c) => c.properties.write || c.properties.writeWithoutResponse);
    if (writable) return writable;
  }
  return null;
}

async function obtenerCaracteristica(server) {
  for (const uuid of SERVICE_UUID_CANDIDATES) {
    try {
      const service = await server.getPrimaryService(uuid);
      const chars = await service.getCharacteristics();
      const writable = chars.find((c) => c.properties.write || c.properties.writeWithoutResponse);
      if (writable) return writable;
    } catch {
      // este dispositivo no tiene ese servicio, se prueba el siguiente
    }
  }
  return encontrarCaracteristicaEscritura(server);
}

// Abre el selector de dispositivos Bluetooth del navegador. Debe llamarse
// directamente desde un click del usuario (requisito de seguridad del navegador).
export async function emparejarImpresora() {
  if (!isWebBluetoothSupported()) {
    throw new Error(
      "Este navegador no soporta Bluetooth web. En iPhone no es posible (limitación de Apple); en Android usa Chrome."
    );
  }
  const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: SERVICE_UUID_CANDIDATES,
  });
  const server = await device.gatt.connect();
  const characteristic = await obtenerCaracteristica(server);
  if (!characteristic) {
    throw new Error(
      "Se conectó al dispositivo pero no se encontró una característica de escritura. Puede que esta impresora no sea compatible con Web Bluetooth."
    );
  }
  cachedDevice = device;
  cachedCharacteristic = characteristic;
  setPrinterConfig({ habilitada: true, nombreDispositivo: device.name || "Impresora Bluetooth" });
  device.addEventListener("gattserverdisconnected", () => {
    cachedCharacteristic = null;
  });
  return device.name || "Impresora Bluetooth";
}

async function asegurarConexion() {
  if (isConnected() && cachedCharacteristic) return cachedCharacteristic;
  if (cachedDevice) {
    // Ya se emparejó antes en esta sesión: se puede reconectar sin volver a
    // mostrar el selector.
    const server = await cachedDevice.gatt.connect();
    cachedCharacteristic = await obtenerCaracteristica(server);
    if (cachedCharacteristic) return cachedCharacteristic;
  }
  // No hay dispositivo en memoria (recién se abrió la app/pestaña): hay que
  // volver a pedirle al usuario que elija la impresora.
  await emparejarImpresora();
  return cachedCharacteristic;
}

function quitarTildes(texto) {
  // Muchas impresoras térmicas baratas no soportan UTF-8 ni acentos/ñ
  // correctamente. Para que el ticket se lea bien SIEMPRE, se reemplazan por
  // su equivalente sin tilde antes de imprimir.
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x00-\x7E]/g, (c) => (c === "\u00f1" || c === "\u00d1" ? (c === "\u00f1" ? "n" : "N") : c));
}

const ESC = 0x1b;
const GS = 0x1d;

function construirComandosTicket({ almacenNombre, fecha, vendedor, productos, total, descuento, totalSinDescuento, metodoPago }) {
  const bytes = [];
  const push = (arr) => bytes.push(...arr);
  const texto = (s) => push(Array.from(new TextEncoder().encode(quitarTildes(s))));
  const linea = (s = "") => { texto(s); push([0x0a]); };

  push([ESC, 0x40]); // init
  push([ESC, 0x61, 0x01]); // centrar
  push([ESC, 0x45, 0x01]); // negrita ON
  linea(almacenNombre || "Almacen");
  push([ESC, 0x45, 0x00]); // negrita OFF
  linea(fecha);
  linea("--------------------------------");
  push([ESC, 0x61, 0x00]); // alinear izquierda

  productos.forEach((p) => {
    linea(`${p.cantidad} x ${p.nombre}`);
    const totalStr = `$${Number(p.total).toLocaleString("es-CL")}`;
    linea(`${" ".repeat(Math.max(0, 32 - totalStr.length))}${totalStr}`);
  });

  linea("--------------------------------");
  if (descuento) {
    linea(`Subtotal: $${Number(totalSinDescuento).toLocaleString("es-CL")}`);
    linea(`Descuento: -$${Number(descuento).toLocaleString("es-CL")}`);
  }
  push([ESC, 0x45, 0x01]);
  linea(`TOTAL: $${Number(total).toLocaleString("es-CL")}`);
  push([ESC, 0x45, 0x00]);
  linea(`Pago: ${metodoPago}`);
  if (vendedor) linea(`Atendido por: ${vendedor}`);
  linea("");
  push([ESC, 0x61, 0x01]);
  linea("Gracias por su compra!");
  push([0x0a, 0x0a, 0x0a, 0x0a]);
  // No se envía comando de corte automático: muchas impresoras térmicas de
  // 58mm de bajo costo no tienen cuchilla y el comando de corte queda
  // ignorado o produce un error. Si tu impresora SÍ corta automáticamente,
  // puedes agregar aquí: push([GS, 0x56, 0x00]);

  return new Uint8Array(bytes);
}

// Envía los bytes en trozos pequeños (los módulos BLE de estas impresoras
// suelen aceptar ~20 bytes por escritura) con una pequeña pausa entre cada
// uno para no saturar el buffer del dispositivo.
async function enviarPorPartes(characteristic, data) {
  const CHUNK = 20;
  for (let i = 0; i < data.length; i += CHUNK) {
    const chunk = data.slice(i, i + CHUNK);
    if (characteristic.properties.writeWithoutResponse) {
      await characteristic.writeValueWithoutResponse(chunk);
    } else {
      await characteristic.writeValue(chunk);
    }
    await new Promise((r) => setTimeout(r, 20));
  }
}

// receiptData: { almacenNombre, vendedor, productos:[{nombre,cantidad,total}],
//                total, descuento, totalSinDescuento, metodoPago }
export async function imprimirTicket(receiptData) {
  const characteristic = await asegurarConexion();
  if (!characteristic) throw new Error("No se pudo conectar con la impresora");
  const datos = construirComandosTicket({
    fecha: new Date().toLocaleString("es-CL"),
    ...receiptData,
  });
  await enviarPorPartes(characteristic, datos);
}

export function desconectarImpresora() {
  if (cachedDevice && cachedDevice.gatt && cachedDevice.gatt.connected) {
    cachedDevice.gatt.disconnect();
  }
  cachedDevice = null;
  cachedCharacteristic = null;
}
