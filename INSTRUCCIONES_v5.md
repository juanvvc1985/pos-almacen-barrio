# INSTRUCCIONES DE INSTALACION - POS Almacen de Barrio v5.0

## Archivos incluidos

| Archivo | Donde va | Reemplaza a |
|---------|----------|-------------|
| firestoreConfig.js | src/services/ | Archivo nuevo |
| types_index.js | src/types/index.js | El types/index.js anterior |
| Mermas.jsx | src/components/ | El Mermas.jsx anterior |
| Offers.jsx | src/components/ | El Offers.jsx anterior |
| Dashboard.jsx | src/pages/ | El Dashboard.jsx anterior |

## Pasos para instalar

### 1. Copiar archivos
- `firestoreConfig.js` → `src/services/firestoreConfig.js` (nuevo archivo)
- `types_index.js` → `src/types/index.js` (reemplazar)
- `Mermas.jsx` → `src/components/Mermas.jsx` (reemplazar)
- `Offers.jsx` → `src/components/Offers.jsx` (reemplazar)
- `Dashboard.jsx` → `src/pages/Dashboard.jsx` (reemplazar)

### 2. Eliminar archivos de datos de prueba (tienda limpia)
Si existen estos archivos, eliminarlos:
- `src/components/DevSeedButton.jsx`
- `src/utils/seedData.js`

### 3. Borrar datos de prueba de Firebase (opcional pero recomendado)
Para empezar limpio:
1. Ve a Firebase Console → Firestore Database
2. Borra las colecciones: productos, ventas, fiados, mermas, turnos
3. Deja solo: users, almacenes, publicUsernames

### 4. Guardar y probar
1. En VS Code: Ctrl + K, luego Ctrl + S (guardar todo)
2. npm run dev
3. Probar cada pestaña

### 5. Commit en GitHub
1. Abrir GitHub Desktop
2. Summary: "v5.0: Criterios configurables Mermas/Ofertas + tienda limpia"
3. Commit to main → Push origin

## Nuevas funcionalidades

### Mermas - Criterios configurables
- Boton "Criterios" arriba a la derecha
- El dueño marca con checkboxes que criterios quiere usar
- Al registrar merma, solo aparecen productos que califiquen:
  - "Vencido" → productos perecederos con lotes ya vencidos
  - Los demas criterios → todos los productos (el dueño elige)
- Los criterios se guardan en Firestore

### Ofertas - Criterios configurables
- Boton "Criterios" arriba a la derecha
- El dueño marca con checkboxes que criterios quiere usar
- "Por vencer" tiene campo para configurar los dias (default 7)
- Al crear oferta, solo aparecen productos que califiquen:
  - "Por vencer" → productos perecederos con lotes que vencen en los proximos X dias
  - Los demas criterios → todos los productos

### Diferenciacion automatica
- Producto YA vencido → va a Merma
- Producto POR vencer (proximos X dias) → va a Oferta
- Producto danado/roto → Merma
- Producto embalaje danado → Oferta
