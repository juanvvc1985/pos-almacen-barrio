# POS Almacen de Barrio - Proyecto Completo

## Cambios incluidos en esta version

### 1. Fiado como metodo de pago en el POS
- Nuevo boton "Fiado" (naranja) junto a Efectivo, Tarjeta y Transferencia
- Modal para ingresar datos del cliente (nombre obligatorio)
- Se descuenta stock automaticamente
- La deuda aparece inmediatamente en Fiados
- Tambien se registra como venta con metodo "fiado" en los informes

### 2. Informe de Mermas
- Nueva pestana "Mermas" en Informes
- Filtros: Hoy, Ultima semana, Ultimo mes, Todo
- Grafico circular por motivo de merma
- Tabla detallada con fecha, producto, motivo, cantidad, perdida

### 3. Informe de Inventario (con exportacion a PDF)
- Nueva pestana "Inventario" en Informes
- Busqueda por nombre, codigo o categoria
- Tabla ordenable (clic en columnas)
- Estados: OK (verde), Critico (naranja), Sin stock (rojo)
- Boton "Exportar PDF" genera un PDF profesional listo para imprimir
- Totales: inversion, potencial de venta, margen estimado

---

## Como instalar

### Paso 1: Instalar libreria para PDF
```
npm install jspdf jspdf-autotable
```

### Paso 2: Descomprimir y reemplazar
1. Descomprime el ZIP
2. Copia la carpeta `pos-almacen-barrio` y pegala en tu carpeta de proyectos
3. Reemplaza todos los archivos existentes

### Paso 3: Correr
```
npm run dev
```
Abre http://localhost:5173/

---

## Datos demo precargados
- 15 productos (Harina, Azucar, Arroz, Queso, Jamon, Frutas, Bebidas, etc.)
- 2 deudas de ejemplo (Juan Perez y Maria Gonzalez)
- Usuario admin precargado (cualquier email/contraseña funciona)

---

## Estructura del proyecto
```
pos-almacen-barrio/
  index.html
  src/
    App.jsx
    main.jsx
    index.css
    components/
      POS.jsx           - Punto de venta con fiado
      ProductManager.jsx - CRUD productos
      Reports.jsx        - Informes (ventas, mermas, inventario + PDF)
      Mermas.jsx         - Control de mermas
      Fiados.jsx         - Ventas a credito
      Navbar.jsx         - Navegacion
      InventoryAlert.jsx - Alertas de stock critico
    pages/
      Login.jsx          - Pantalla de login
      Dashboard.jsx      - Layout principal
    services/
      demoData.js        - Datos en memoria / localStorage
      products.js        - Servicio de productos
      sales.js           - Servicio de ventas y turnos
      mermas.js          - Servicio de mermas
      fiados.js          - Servicio de fiados
    hooks/
      useAuth.jsx        - Autenticacion demo
      useOffline.js      - Detector de conexion
    utils/
      format.js          - Formato de moneda y fechas
    types/
      index.js           - Constantes y enums
    firebase/
      config.js          - Configuracion Firebase (lista pero no activada)
```
