# Guía de Desarrollo - MagicField Admin

## Inicio Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar IP local (editar src/services/config.ts)
# Cambiar DEV: 'http://192.168.1.100:8080' a tu IP

# 3. Ejecutar
npm start

# 4. Escanear código QR con Expo Go en tu dispositivo
```

## Arquitectura

### Servicios (Services)

- **api.ts**: Cliente HTTP centralizado con reintentos automáticos
- **config.ts**: Configuración por ambiente (DEV/PROD)

### Hooks Personalizados

- **useAsync**: Hook genérico para operaciones asincrónicas
- **useAsyncMutation**: Hook para mutaciones (create/update/delete)
- **useProducts**: Hooks específicos para gestión de productos
- **useScryfallSearch**: Hook para búsqueda de cartas

### Componentes

- **StockAdjuster**: Botones +/- para ajustar stock
- **ProductCard**: Tarjeta de producto con acciones
- **ImageUploader**: Selector y previsualizador de imágenes
- **CardSearch**: Búsqueda integrada de Scryfall

### Pantallas

- **ProductsScreen**: Listado principal de productos
- **CreateProductScreen**: Selección de tipo y creación
- **EditProductScreen**: Edición de productos existentes
- **ProductDetailScreen**: Detalles completos del producto
- **DashboardScreen**: Estadísticas y resumen
- **SettingsScreen**: Configuración de la app

## Tipos de Productos

### Single
- Cartas individuales con búsqueda Scryfall
- Campos: cardName, set, collectorNumber, condition, language, isFoil

### Sealed
- Productos sellados (booster, caja, etc)
- Campos: releaseDate (opcional)

### Other
- Otros tipos de productos
- Solo campos básicos: name, description, price, stock

## Extender la Aplicación

### Agregar un nuevo tipo de producto

1. En `src/types/index.ts`:
```typescript
export interface NewTypeProduct extends BaseProduct {
  type: 'newtype';
  customField: string;
}

export type Product = SingleProduct | SealedProduct | NewTypeProduct;
```

2. En `CreateProductScreen.tsx`, agregar a PRODUCT_TYPES:
```typescript
{
  label: 'Nuevo Tipo',
  value: 'newtype',
  description: 'Descripción del nuevo tipo',
}
```

3. Agregar interfaz de entrada de datos en la pantalla

### Agregar una nueva pantalla

1. Crear archivo en `src/screens/NewScreen.tsx`
2. Exportar en `src/screens/index.ts`
3. Agregar a `RootNavigator.tsx`:
```typescript
<Drawer.Screen
  name="NewScreen"
  component={NewScreen}
  options={{
    drawerLabel: 'Etiqueta',
    title: 'Título',
  }}
/>
```

## Variables de Entorno

Las variables se definen en `src/services/config.ts`. Para producción, cambiar:

```typescript
const isProduction = process.env.NODE_ENV === 'production';
```

## Testing

Actualmente no hay tests configurados. Para agregar:

```bash
npm install --save-dev @testing-library/react-native jest
```

## Rendimiento

- Usa `useMemo` y `useCallback` en operaciones costosas
- Las imágenes se comprimen a 0.8 de calidad automáticamente
- Los reintentos tienen backoff exponencial

## Seguridad

- Las credenciales de API están en el cliente (considerar servidor proxy en producción)
- No incluir tokens sensibles en el código
- Validar entrada de usuario en el backend

## Debugging

### Ver logs

```bash
# Terminal 1: Inicia Expo
npm start

# Terminal 2: Ver logs
expo logs
```

### Debugger en Chrome

1. Presiona `d` en Expo CLI
2. Abre Chrome DevTools (F12)
3. Usa console.log normalmente

### Redux DevTools (si se agrega Redux)

Se puede integrar React Native Debugger para Redux.

## Problemas Comunes

### Error: "Cannot find module '@types/react'"

```bash
npm install --save-dev @types/react @types/react-native
```

### Error de CORS en el backend

Asegurar que el backend permite CORS:
```java
// Spring Boot
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("*")
            .allowedMethods("*");
    }
}
```

### No se conecta al backend

1. Verifica que backend está corriendo: `http://IP:8080/health`
2. En Android, usa la IP de tu máquina: `ping localhost` desde terminal
3. En emulador, podrías usar `10.0.2.2` para localhost

### Imágenes no se cargan

- Verifica el endpoint `/api/images/upload`
- El backend debe retornar `{ id, url }`
- Los permisos en Android/iOS deben estar habilitados

## Estructura de Datos Esperada del Backend

### GET /api/products

```json
[
  {
    "id": "1",
    "name": "Black Lotus",
    "description": "One of the most valuable cards",
    "price": 15000.00,
    "stock": 1,
    "type": "single",
    "imageUrl": "https://...",
    "cardName": "Black Lotus",
    "set": "LTD",
    "collectorNumber": "1",
    "condition": "NM",
    "language": "EN",
    "isFoil": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### POST /api/images/upload

Request:
```
Content-Type: multipart/form-data
file: <binary image>
productId: "product-id"
```

Response:
```json
{
  "id": "image-123",
  "url": "https://cdn.magicfield.com/images/image-123.jpg"
}
```

## Próximas Mejoras

- [ ] Autenticación/Login
- [ ] Sincronización offline
- [ ] Búsqueda y filtros avanzados
- [ ] Exportación de datos
- [ ] Notificaciones push
- [ ] Categorización de productos
- [ ] Historial de cambios de precios
- [ ] Gestión de múltiples usuarios
- [ ] Soporte para idiomas múltiples

## Build para Producción

```bash
# Android
eas build -p android

# iOS
eas build -p ios

# Ambos
eas build
```

Requiere configurar EAS CLI. Más información en: https://docs.expo.dev/eas/

---

¡Feliz desarrollo! 🚀
