# Instalación Rápida - MagicField Admin

## Paso 1: Preparar el Ambiente

```bash
# Si no tienes Node.js, descárgalo de https://nodejs.org/
node --version  # Debe ser 16+

# Instala Expo CLI (si no lo tienes)
npm install -g expo-cli
expo --version
```

## Paso 2: Instalar Dependencias

```bash
cd magicfield-admin
npm install
```

Esto installará:
- React Native + Expo
- React Navigation (Drawer)
- Axios (HTTP client)
- TypeScript
- Y dependencias relacionadas

## Paso 3: Configurar URL del Backend

**Archivo**: `src/services/config.ts`

Línea 6, cambia:
```typescript
DEV: 'http://192.168.1.100:8080',  // ← Cambia esto a tu IP
```

Para encontrar tu IP:

**Windows (PowerShell)**:
```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127.0.0.1"}
```

**Mac/Linux**:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Busca algo como: `192.168.x.x` o `10.0.x.x`

## Paso 4: Asegurar que el Backend Esté Corriendo

```bash
# Prueba que el backend responde
curl http://192.168.1.100:8080/health

# Deberías recibir algo como: {"status":"ok"}
```

Si no tienes curl:
- Abre en navegador: `http://192.168.1.100:8080/health`

## Paso 5: Instalar Expo Go

- **Android**: Google Play Store
- **iOS**: App Store
- Búsca "Expo Go" (por Expo Inc)

## Paso 6: Iniciar la Aplicación

```bash
npm start
```

Verás algo como:
```
Expo Go
To open this project with Expo Go, scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

## Paso 7: Usar la App

1. Abre Expo Go en tu teléfono
2. Presiona el botón de "+cámara" o "Scan code"
3. Escanea el código QR que aparece en la terminal
4. Espera a que cargue (toma 30-60 segundos la primera vez)
5. ¡Disfruta! 🎉

---

## Troubleshooting Rápido

### "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Error: connect ECONNREFUSED"
- Backend no está corriendo
- URL configurada incorrectamente
- En emulador Android, prueba con `10.0.2.2` en lugar de `localhost`

### "La app notiene permiso para acceder a fotos"
- En Settings del teléfono → Permisos → Expo Go → Permitir acceso a fotos

### "El código QR no escanea"
- Presiona `w` en la terminal y abre en navegador
- O presiona `c` para limpiar la caché

---

## Comandos Útiles

```bash
# Ver logs
npm start

# En otra terminal, ver logs detallados
expo logs

# Limpiar caché
expo start -c

# Abrir en Android (emulador)
npm run android

# Abrir en iOS (emulador)
npm run ios

# Abrir en web
npm run web
```

---

## Primeras Pruebas

1. **Ver Productos**: Debería cargar una lista (vacía si el backend no tiene productos)
2. **Dashboard**: Click en hamburguesa → Dashboard → Ver estadísticas
3. **Crear Producto**: Click en hamburguesa → Crear Producto → Selecciona "Single"
4. **Buscar Carta**: Escribe un nombre de carta en Scryfall (ej: "Black Lotus")
5. **Ajustar Stock**: En el listado, presiona +/- para cambiar stock al instante

---

## Próximos Pasos

- Leer README.md para entender la estructura
- Leer DEVELOPMENT.md para extender la aplicación
- Ver CHECKLIST.md para verificar qué está hecho

---

¡Necesitas ayuda? Revisa DEVELOPMENT.md en la sección "Problemas Comunes"

Happy coding! 🚀
