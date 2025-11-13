# Correcciones Realizadas - SPA WS Lab

Este documento detalla los errores encontrados durante la configuración inicial y las soluciones aplicadas.

---

## 1. Error de Dependencia: zone.js incompatible

**Error:**
```
npm error ERESOLVE unable to resolve dependency tree
npm error peer zone.js@"~0.14.0" from @angular/core@17.3.12
```

**Causa:**
Angular 17 requiere `zone.js@~0.14.0`, pero el proyecto tenía `zone.js@^0.13.0`.

**Solución:**
Actualizar `zone.js` en `frontend/package.json:23`:
```json
"zone.js": "^0.14.0"
```

**Comando ejecutado:**
```bash
cd frontend
npm install
```

---

## 2. Puerto 8080 en Uso (EADDRINUSE)

**Error:**
```
Error: listen EADDRINUSE: address already in use :::8080
```

**Causa:**
Otro proceso estaba usando el puerto 8080.

**Solución:**
Cambiar el puerto del WebSocket de 8080 a 8081.

### Archivos modificados:

**Backend** - `backend/server-ws.js:4-5`:
```javascript
const wss = new WebSocket.Server({ port: 8081 }, () => {
  console.log('WebSocket server listening on ws://localhost:8081');
});
```

**Frontend** - `frontend/src/app/services/websocket.service.ts:16`:
```typescript
private WS_URL = 'ws://localhost:8081';
```

---

## 3. Falta @angular-devkit/build-angular

**Error:**
```
Error: Could not find the '@angular-devkit/build-angular:dev-server' builder's node package.
```

**Causa:**
Faltaban dependencias de desarrollo esenciales de Angular.

**Solución:**
Agregar dependencias faltantes en `frontend/package.json:25-29`:
```json
"devDependencies": {
  "@angular-devkit/build-angular": "^17.0.0",
  "@angular/cli": "^17.0.0",
  "@angular/compiler-cli": "^17.0.0",
  "typescript": "~5.4.2"
}
```

**Comando ejecutado:**
```bash
cd frontend
npm install
```

---

## 4. Falta tsconfig.json en Raíz

**Error:**
```
Error: error TS5012: Cannot read file 'C:/Users/.../spa_ws-lab/tsconfig.json': ENOENT
```

**Causa:**
Angular buscaba `tsconfig.json` en la raíz del proyecto pero solo existía en `frontend/`.

**Solución:**
Crear `tsconfig.json` en la raíz del proyecto:
```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    "outDir": "./dist/out-tsc",
    "sourceMap": true,
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "target": "ES2020",
    "module": "ESNext",
    "lib": [
      "ES2020",
      "DOM"
    ]
  }
}
```

---

## 5. Error NG0908 - Página en Blanco

**Error:**
```
main.js:1 T: NG0908
```

**Causa:**
Faltaba `zone.js` en los polyfills de Angular, causando que la aplicación no pudiera inicializarse correctamente.

**Solución:**
Agregar `zone.js` a los polyfills en `frontend/angular.json:16-18`:
```json
"polyfills": [
  "zone.js"
],
```

**Comando ejecutado:**
```bash
cd frontend
npm start
```
*(Reiniciar el servidor para que Angular recompile)*

---

## Resumen de Cambios

### Archivos Creados:
- `tsconfig.json` (raíz del proyecto)
- `CORRECCIONES_README.md` (este archivo)

### Archivos Modificados:
1. `frontend/package.json` - Actualización de dependencias
2. `backend/server-ws.js` - Cambio de puerto 8080 → 8081
3. `frontend/src/app/services/websocket.service.ts` - URL del WebSocket actualizada
4. `frontend/angular.json` - Agregado zone.js a polyfills
5. `frontend/src/main.ts` - Configuración de bootstrapping mejorada

---

## Comandos Finales para Ejecutar

### Backend:
```bash
cd backend
npm install
npm start
```
Debería ver: `WebSocket server listening on ws://localhost:8081`

### Frontend:
```bash
cd frontend
npm install
npm start
```
Se abrirá automáticamente en `http://localhost:4200`

---

## Warnings No Críticos

Durante la instalación pueden aparecer warnings de dependencias obsoletas. Estos son **normales y no afectan el funcionamiento**:
- `deprecated read-package-json`
- `deprecated inflight`, `rimraf`, `glob`
- Vulnerabilidades de baja/moderada severidad

**No es necesario ejecutar** `npm audit fix --force` a menos que sea estrictamente necesario, ya que puede causar breaking changes.

---

**Fecha:** 2025-11-06
**Generado por:** Claude Code
