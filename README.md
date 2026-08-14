# 🎁 Sistema de Códigos Beta — Loventa POS

## 📁 Estructura del paquete

```
src/
├── services/
│   └── paymentService.js          ← Compatibilidad legacy + funciones beta
├── components/
│   ├── BetaCodesAdmin.jsx         ← Panel admin para crear códigos
│   ├── CanjearCodigo.jsx          ← Formulario para canjear códigos
│   └── Navbar.jsx                 ← Navbar con botón "Códigos Beta"
├── pages/
│   ├── Dashboard.jsx              ← Rutas del dashboard (incluye /admin-beta)
│   └── Login.jsx                  ← Login accesible (sin warnings)
└── App.jsx                        ← Rutas principales (incluye /canjear-beta)
```

---

## 🚀 Instalación (1 solo paso)

Copia cada archivo a la ruta correspondiente en tu proyecto, **reemplazando** los existentes.

---

## 🔐 Paso obligatorio: Configurar tu UID de admin

Abre `src/components/BetaCodesAdmin.jsx`, línea 18.

Reemplaza esto:
```jsx
const ADMIN_UIDS = [
  // "PEGA-TU-UID-AQUI",
];
```

Por esto (con TU UID real):
```jsx
const ADMIN_UIDS = [
  "tu-uid-de-firebase-aqui",
];
```

### ¿Cómo obtener tu UID?
1. Abre tu app en el navegador y loguéate con tu cuenta de dueño
2. Presiona **F12** → pestaña **Console**
3. Pega y ejecuta:
   ```js
   console.log(JSON.parse(localStorage.getItem("pos_offline_session")).uid)
   ```
4. Copia el string que aparece (ej: `"AbC123XyZ..."`)
5. Pégalo en `ADMIN_UIDS`

> ⚠️ **Sin este paso, el panel admin mostrará "Acceso Restringido" para TODOS, incluyéndote a ti.**

---

## 🔄 Flujo de uso

### 1. Crear un código beta (como admin)
1. Entra a tu app como dueño
2. En el Navbar, haz clic en **🔑 Códigos Beta**
3. Completa el formulario:
   - **Código**: déjalo vacío para auto-generar, o escribe uno personalizado
   - **Días Pro**: cuántos días de plan Pro gratis otorga (ej: 30)
   - **Cantidad**: cuántos códigos crear (ej: 10)
4. Haz clic en **➕ Crear Código(s)**
5. El código aparece en la tabla con estado 🟢 Activo

### 2. Canjear un código beta (como usuario nuevo)
1. El usuario nuevo entra a: `https://tu-app.com/canjear-beta`
2. Ingresa el código (ej: `ABC12345`) y haz clic en **🎁 Canjear Código**
3. Si es válido:
   - Su plan cambia a **pro_gratis**
   - Tiene acceso Pro por los días configurados
   - El código queda marcado como ✅ Usado
4. Cuando expire, `paymentService.js` lo baja automáticamente a plan **básico**

---

## 🛠️ Qué arregla cada archivo

| Archivo | Problema original | Solución |
|---------|------------------|----------|
| `paymentService.js` | Usuarios creados antes del sistema de pagos quedaban suspendidos (sin fechas de expiración) | Detecta usuarios "legacy" sin fechas y los marca como activos automáticamente |
| `BetaCodesAdmin.jsx` | Cualquier dueño podía crear códigos beta | Solo los UIDs en `ADMIN_UIDS` pueden crear códigos. Muestra "Acceso Restringido" para el resto |
| `CanjearCodigo.jsx` | No existía | Nuevo componente para que usuarios canjeen códigos y activen Pro gratis |
| `Login.jsx` | Warnings de DevTools: inputs sin `id`/`name`, labels sin `htmlFor` | Todos los campos tienen atributos de accesibilidad correctos. Autocompletado del navegador funciona |
| `Dashboard.jsx` | No tenía ruta para el panel admin | Agrega `/admin-beta` protegida por `isDueño` |
| `Navbar.jsx` | No tenía botón para acceder al panel admin | Agrega botón **🔑 Códigos Beta** visible solo para dueños |
| `App.jsx` | No tenía ruta pública para canjear códigos | Agrega `/canjear-beta` accesible sin login |

---

## ⚠️ Notas importantes

- **No modifiques** `firestore.rules` para restringir `codigosBeta` por ahora. El control de acceso se hace por UID en el frontend.
- Los códigos beta son **de un solo uso**. Una vez canjeados, no se pueden reutilizar.
- Los códigos pueden tener **fecha de expiración**. Si expiran antes de ser usados, el usuario verá "Código expirado".
- El plan **pro_gratis** es distinto de **pro** pagado. Cuando expire, el usuario baja a **básico**, no a **pro expirado**.

---

## 🆘 Si algo no funciona

| Síntoma | Causa probable | Solución |
|---------|---------------|----------|
| "Acceso Restringido" en panel admin | No pusiste tu UID en `ADMIN_UIDS` | Sigue el paso "Configurar tu UID de admin" arriba |
| "Error al cargar códigos" | No existe la colección `codigosBeta` en Firestore | Crea un código manualmente desde el panel, o crea la colección vacía en Firebase Console |
| "Error al canjear: Código no encontrado" | El código no existe o tiene espacios | Verifica que el código esté escrito exactamente igual (mayúsculas) |
| Mi cuenta sigue suspendida | `paymentService.js` no se está usando en `useAuth.jsx` | Verifica que `useAuth.jsx` importe `verificarEstadoV2` y `autoUpgradeFases` de `paymentService.js` |

---

Generado para Loventa POS — Almacén de Barrio v5.0
