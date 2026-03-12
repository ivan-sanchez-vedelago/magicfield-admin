# MagicField Admin - Aplicación Móvil

Aplicación móvil de administración para MagicField desarrollada con React Native, Expo y TypeScript.

## Descripción

MagicField Admin es una herramienta rápida y eficiente para administrar productos desde tu dispositivo móvil. Permite gestionar el inventario, actualizar precios, modificar stock en tiempo real, crear productos nuevos y subir imágenes.

## Características

- ✅ **Gestión de Productos**: Ver, crear, editar y eliminar productos
- ✅ **Control Rápido de Stock**: Ajusta el stock con botones + / -
- ✅ **Modificación de Precios**: Actualiza precios rápidamente
- ✅ **Búsqueda Scryfall**: Busca cartas Magic: The Gathering automáticamente
- ✅ **Subida de Imágenes**: Carga imágenes desde la galería del dispositivo
- ✅ **Tipos de Productos**: Soporta Singles, Sealed y otros tipos
- ✅ **Dashboard**: Visualiza estadísticas en tiempo real
- ✅ **Navegación con Drawer**: Fácil acceso a todas las secciones

## Estructura del Proyecto

```
magicfield-admin/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── StockAdjuster.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ImageUploader.tsx
│   │   └── CardSearch.tsx
│   ├── screens/             # Pantallas de la aplicación
│   │   ├── ProductsScreen.tsx
│   │   ├── CreateProductScreen.tsx
│   │   ├── EditProductScreen.tsx
│   │   ├── ProductDetailScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── navigation/          # Configuración de navegación
│   │   ├── RootNavigator.tsx
│   │   └── types.ts
│   ├── services/            # Servicios de API
│   │   ├── api.ts
│   │   └── config.ts
│   ├── hooks/               # Hooks personalizados
│   │   ├── useAsync.ts
│   │   ├── useProducts.ts
│   │   └── useScryfallSearch.ts
│   ├── types/               # Tipos TypeScript
│   ├── utils/               # Utilidades
│   └── App.tsx              # Componente raíz
├── app.json                 # Configuración de Expo
├── package.json
├── tsconfig.json
└── index.js                 # Punto de entrada
```

## Requisitos

- Node.js 16+
- npm o yarn
- Expo CLI: `npm install -g expo-cli`
- Un dispositivo móvil (Android/iOS) o emulador

## Instalación

### 1. Instalar dependencias

```bash
cd magicfield-admin
npm install
```

### 2. Configurar la URL del Backend

Edita `src/services/config.ts` y actualiza la URL del backend:

```typescript
const ENV = {
  DEV: 'http://192.168.1.100:8080', // Cambia a tu IP local
  PROD: 'https://api.magicfield.com',
};
```

### 3. Ejecutar la aplicación

```bash
# Inicia el servidor de Expo
npm start

# Luego elige:
# a - Para abrir en Android
# i - Para abrir en iOS
# w - Para abrir en web
# Escanea el código QR con Expo Go en tu celular
```

## Uso

### Pantalla de Productos

- **Listar**: Ver todos los productos disponibles
- **Buscar**: Desplázate para buscar rápidamente
- **Ajustar Stock**: Usa los botones +/- para modificar inmediatamente
- **Editar**: Toca el botón de editar para cambiar detalles
- **Eliminar**: Remueve productos del inventario

### Crear Producto

1. Selecciona el tipo (Single, Sealed, Otro)
2. Carga imágenes (opcional)
3. Completa los datos básicos

**Para Singles:**
- Busca la carta en Scryfall
- Se auto-completan datos como nombre, set, número de coleccionista
- Especifica condición, idioma y si es foil

**Para otros tipos:**
- Ingresa manualmente nombre, descripción, precio y stock

### Dashboard

- Visualiza estadísticas en tiempo real
- Cantidad total de productos
- Stock total
- Valor total del inventario
- Productos sin stock
- Distribución por tipo

### Configuración

- Cambiar URL del backend
- Información de la aplicación
- Datos del desarrollador

## API Endpoints

La aplicación consume los siguientes endpoints del backend:

### Productos

- `GET /api/products` - Listar todos los productos
- `GET /api/products/{id}` - Obtener un producto
- `POST /api/products` - Crear producto
- `PUT /api/products/{id}` - Actualizar producto
- `DELETE /api/products/{id}` - Eliminar producto

### Imágenes

- `POST /api/images/upload` - Subir imagen
- `DELETE /api/images/{id}` - Eliminar imagen

### Scryfall (Externo)

- `GET https://api.scryfall.com/cards/search?q={query}` - Buscar cartas

## Modelos de Datos

### Producto Base

```typescript
{
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  type: 'single' | 'sealed' | 'other';
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### Producto Single

```typescript
{
  ...BaseProduct;
  type: 'single';
  cardName: string;
  set: string;
  collectorNumber: string;
  condition?: string;
  language?: string;
  isFoil?: boolean;
  scryfallId?: string;
}
```

## Tecnologías Utilizadas

- **React Native** - Framework móvil
- **Expo** - Plataforma de desarrollo
- **TypeScript** - Lenguaje tipado
- **React Navigation** - Sistema de navegación
- **Axios** - Cliente HTTP
- **React Native Gesture Handler** - Manejo de gestos
- **Expo Image Picker** - Selección de imágenes

## Configuración del Backend

Asegúrate de que tu backend esté:

1. Corriendo en el puerto configurado (por defecto 8080)
2. Accesible desde tu red local
3. Con los endpoint `/api/products` y `/api/images` implementados
4. Con soporte para CORS (si es necesario)

## Solución de Problemas

### "No se pudo conectar con el servidor"

- Verifica que el backend está corriendo
- Verifica la URL en `src/services/config.ts`
- En Android, asegúrate de que la IP es correcta (probablemente `192.168.x.x`)
- Intenta con `localhost` solo en emulador

### "No se encontraron cartas en Scryfall"

- Verifica tu conexión a internet
- Intenta con un nombre de carta diferente
- Scryfall podría estar temporalmente no disponible

### Imágenes no se cargan

- Verifica que los permisos de acceso a galería están habilitados
- Comprueba que el backend acepta las imágenes
- Revisa la URL de subida en la configuración

## Desarrollo

### Scripts disponibles

```bash
npm start      # Inicia Expo
npm run lint   # Ejecuta linter
```

### Pasos para agregar un nuevo tipo de producto

1. Agrega el tipo en `src/types/index.ts`
2. Crea una interfaz que extienda `BaseProduct`
3. Agrega campos específicos en `CreateProductScreen.tsx`
4. Actualiza `ProductCard.tsx` si necesita mostrar diferente

### Extensibilidad

La arquitectura permite fácilmente:

- Agregar nuevos tipos de productos
- Integrar nuevas fuentes de datos (No solo Scryfall)
- Crear nuevas pantallas
- Modificar estilos globales

## Licencia

Este proyecto es parte de MagicField.

## Contribución

Para contribuir, por favor crea un branch con tus cambios y envía un pull request.

## Contacto

Para reportar bugs o sugerencias, contacta con el equipo de desarrollo de MagicField.

---

**Versión**: 1.0.0  
**Estado**: Beta  
**Última actualización**: Marzo 2026
