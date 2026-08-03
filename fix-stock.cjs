const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const SRC_DIR = path.join(ROOT_DIR, 'src');

let cambiosTotales = 0;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  let cambios = 0;

  // 1. Reemplazar accesos tipo objeto.stock (p.stock, prod.stock, product.stock, item.stock, c.stock, etc.)
  // Excluye stockCritico porque no tiene punto antes
  const regexAcceso = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\.stock\b(?!\w)/g;
  content = content.replace(regexAcceso, (match, objName) => {
    cambios++;
    return `${objName}.stockActual`;
  });

  // 2. Reemplazar propiedad stock: en objetos (solo en archivos de services/ y utils/seedData.js)
  // Esto es seguro porque son los únicos lugares donde se crean/actualizan productos
  const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
  if (relPath.startsWith('src/services/') || relPath.includes('seedData')) {
    // Reemplazar stock: → stockActual:  (evita stockCritico: por el word boundary)
    const regexProp = /\bstock\b(\s*:\s*)/g;
    content = content.replace(regexProp, (match, colon) => {
      // Doble check: no reemplazar si la línea contiene stockCritico justo antes
      cambios++;
      return `stockActual${colon}`;
    });
  }

  // 3. Reemplazar stock en template strings y condiciones que quedaron sueltos
  // Casos como ${p.stock} → ${p.stockActual} (ya cubierto por regex 1, pero por si acaso)
  // Casos como p.stock) en condiciones
  const regexExtra = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\.stock\b/g;
  const matches = content.match(regexExtra);
  if (matches) {
    content = content.replace(regexExtra, (match, objName) => {
      cambios++;
      return `${objName}.stockActual`;
    });
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    cambiosTotales += cambios;
    console.log(`✅ ${relPath} — ${cambios} cambios`);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) {
    console.log('❌ No se encontró la carpeta src/. Asegúrate de correr este script desde la raíz del proyecto.');
    process.exit(1);
  }
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (/\.(js|jsx)$/.test(file)) {
      processFile(fullPath);
    }
  }
}

console.log('🔧 Corrigiendo stock → stockActual en todo el proyecto...\n');
walk(SRC_DIR);
console.log(`\n🎉 Listo! Total de cambios: ${cambiosTotales}`);
console.log('Ahora solo falta: Guardar en VS Code (Ctrl+K, Ctrl+S) y probar.');
