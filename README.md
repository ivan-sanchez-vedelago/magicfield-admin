# MagicField Admin - Aplicación Móvil

Aplicación móvil de administración para MagicField desarrollada con React Native, Expo y TypeScript.

## Descripción

MagicField Admin es una herramienta rápida y eficiente para administrar productos desde tu dispositivo móvil. Permite gestionar el inventario, actualizar precios, modificar stock en tiempo real, crear productos nuevos y subir imágenes.

## Características Principales

- ✅ **Gestión de Productos**: Ver, crear, editar y eliminar productos
- ✅ **Control Rápido de Stock**: Ajusta el stock con botones + / -
- ✅ **Modificación de Precios**: Actualiza precios rápidamente
- ✅ **Búsqueda Scryfall**: Busca cartas Magic: The Gathering automáticamente
- ✅ **Subida de Imágenes**: Carga imágenes desde la galería del dispositivo
- ✅ **Tipos de Productos**: Soporta Singles, Sealed y otros tipos
- ✅ **Dashboard**: Visualiza estadísticas en tiempo real
- ✅ **Navegación con Drawer**: Fácil acceso a todas las secciones

## Stack Tecnológico

- **Framework**: React Native + Expo
- **Lenguaje**: TypeScript
- **Navegación**: React Navigation (Drawer + Stack)
- **HTTP Client**: Axios
- **Estado**: React Hooks + Context
- **Almacenamiento**: AsyncStorage (local)
- **API**: REST API (Spring Boot backend)

## Estructura del Proyecto

```
magicfield-admin/
├── src/
│   ├── App.tsx                          # Componente raíz
│   ├── components/                      # Componentes reutilizables
│   │   ├── StockAdjuster.tsx           # +/- buttons
│   │   ├── ProductCard.tsx             # Tarjeta de producto
│   │   ├── ImageUploader.tsx           # Selector de imágenes
│   │   ├── CardSearch.tsx              # Búsqueda Scryfall
│   │   └── index.ts
│   ├── screens/                         # Pantallas de la app
│   │   ├── ProductsScreen.tsx          # Listado
│   │   ├── CreateProductScreen.tsx     # Crear
│   │   ├── EditProductScreen.tsx       # Editar
│   │   ├── ProductDetailScreen.tsx     # Detalles
│   │   ├── DashboardScreen.tsx         # Estadísticas
│   │   ├── SettingsScreen.tsx          # Configuración
│   │   └── index.ts
│   ├── navigation/                      # Configuración de navegación
│   │   ├── RootNavigator.tsx           # Drawer + Stack
│   │   └── types.ts
│   ├── services/                        # Servicios
│   │   ├── api.ts                      # Cliente HTTP
│   │   └── config.ts                   # Configuración
│   ├── hooks/                           # Hooks personalizados
│   │   ├── useAsync.ts
│   │   ├── useProducts.ts
│   │   ├── useScryfallSearch.ts
│   │   └── index.ts
│   ├── types/                           # Tipos TypeScript
│   │   └── index.ts
│   └── utils/                           # Utilidades
│       └── debounce.ts
├── assets/                              # Recursos (vacío)
├── index.js                             # Punto de entrada
├── app.json                             # Configuración Expo
├── package.json                         # Dependencias
├── tsconfig.json                        # Configuración TypeScript
├── README.md                            # Este archivo
└── .gitignore                           # Archivos ignorados
```

## Requisitos

- Node.js 16+
- npm o yarn
- Expo CLI: `npm install -g expo-cli`
- Un dispositivo móvil (Android/iOS) o emulador

## Instalación Rápida

### 1. Instalar dependencias
```bash
cd magicfield-admin
npm install
```

### 2. Configurar URL del Backend
Edita `src/services/config.ts` y actualiza la URL del backend:

```typescript
const ENV = {
  DEV: 'http://192.168.1.100:8080', // Cambia a tu IP local
  PROD: 'https://api.magicfield.com',
};
```

### 3. Ejecutar la aplicación
```bash
npm start
```

Luego elige:
- `a` - Para abrir en Android
- `i` - Para abrir en iOS
- `w` - Para abrir en web

## Uso de la Aplicación

### Pantalla de Productos
- **Listar**: Ver todos los productos disponibles
- **Buscar**: Buscar productos por nombre
- **Ajustar Stock**: Botones + / - para modificar stock rápidamente
- **Editar**: Tocar un producto para editar precio/nombre
- **Eliminar**: Mantener presionado para eliminar

### Crear Producto
- **Seleccionar Tipo**: Single, Sealed u Other
- **Para Singles**: Usar búsqueda Scryfall para autocompletar datos
- **Imágenes**: Seleccionar hasta 5 imágenes de la galería
- **Guardar**: Crear el producto en el backend

### Dashboard
- **Estadísticas**: Ver total de productos, stock bajo, etc.
- **Resumen**: Información general del inventario

### Configuración
- **API Settings**: Cambiar URL del backend
- **Acerca de**: Información de la aplicación

## Tipos de Productos

### Single (Cartas Individuales)
- Cartas individuales con búsqueda Scryfall
- Campos: name, cardName, set, collectorNumber, condition, language, isFoil, price, stock
- Búsqueda automática en Scryfall API

### Sealed (Productos Sellados)
- Booster packs, cajas, etc.
- Campos: name, description, releaseDate (opcional), price, stock

### Other (Otros Productos)
- Cualquier otro tipo de producto
- Campos básicos: name, description, price, stock

## Arquitectura Técnica

### Servicios (Services)
- **api.ts**: Cliente HTTP centralizado con Axios
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

## Guía de Desarrollo

### Inicio Rápido para Desarrolladores
```bash
# 1. Instalar dependencias
npm install

# 2. Configurar IP local del Backend
# Editar src/services/config.ts y actualizar la IP

# 3. Iniciar Expo en modo desarrollo
npx expo start --clear

# 4. En la terminal, presionar 's' para activar modo desarrollo
# Luego escanea el código QR con Expo Go
```

**Requisitos antes de ejecutar:**
- El backend debe estar corriendo en `http://TU_IP_LOCAL:8080`
- Tener Expo Go instalado en el dispositivo móvil

### Extender la Aplicación

#### Agregar un nuevo tipo de producto
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

#### Agregar interfaz de entrada de datos en la pantalla

#### Agregar una nueva pantalla
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

### Tipos TypeScript
```typescript
// Base product
export interface BaseProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  images?: string[];
  type: 'single' | 'sealed' | 'other';
}

// Single product (Magic cards)
export interface SingleProduct extends BaseProduct {
  type: 'single';
  cardName: string;
  set: string;
  collectorNumber: string;
  condition: string;
  language: string;
  isFoil: boolean;
}

// Sealed product
export interface SealedProduct extends BaseProduct {
  type: 'sealed';
  releaseDate?: string;
}

// Other product
export interface OtherProduct extends BaseProduct {
  type: 'other';
}

export type Product = SingleProduct | SealedProduct | OtherProduct;
```

## Checklist de Implementación

### ✅ Completado
- [x] Inicializar proyecto Expo con TypeScript
- [x] Crear estructura de carpetas
- [x] Configurar tsconfig.json y app.json
- [x] Crear package.json con dependencias

### ✅ Tipos y Modelos
- [x] Crear tipos base de producto (BaseProduct)
- [x] Crear tipos específicos (SingleProduct, SealedProduct, OtherProduct)
- [x] Crear tipos de API (ApiResponse, ApiErrorResponse)
- [x] Crear tipos de Scryfall

### ✅ Servicios y API
- [x] Crear servicio API centralizado (api.ts)
- [x] Configurar endpoints (/api/products, /api/images)
- [x] Implementar métodos CRUD
- [x] Implementar búsqueda Scryfall
- [x] Agregar reintentos automáticos
- [x] Implementar health check

### ✅ Hooks Personalizados
- [x] useAsync (genérico)
- [x] useAsyncMutation (para mutaciones)
- [x] useProducts (listar, obtener por ID)
- [x] useCreateProduct
- [x] useUpdateProduct
- [x] useDeleteProduct
- [x] useUpdateProductStock
- [x] useUpdateProductPrice
- [x] useScryfallSearch

### ✅ Componentes Reutilizables
- [x] StockAdjuster (+/- buttons)
- [x] ProductCard (tarjeta con acciones)
- [x] ImageUploader (selector y preview)
- [x] CardSearch (búsqueda Scryfall)

### ✅ Pantallas
- [x] ProductsScreen (listado con scroll y acciones rápidas)
- [x] CreateProductScreen (selector de tipo + formulario)
- [x] EditProductScreen (edición de producto existente)
- [x] ProductDetailScreen (vista completa)
- [x] DashboardScreen (estadísticas y resumen)
- [x] SettingsScreen (configuración de API)

### ✅ Navegación
- [x] Configurar React Navigation
- [x] Drawer Navigation con 4 secciones principales
- [x] Stack Navigation para Products
- [x] Pantalla inicial en Products
- [x] Iconos emoji para drawer items

### ✅ Utilidades
- [x] debounce (para búsqueda)
- [x] Estilos coherentes

### ✅ Documentación
- [x] README.md (instrucciones de instalación y uso)
- [x] QUICKSTART.md (guía de instalación rápida)
- [x] DEVELOPMENT.md (guía de desarrollo)
- [x] CHECKLIST.md (verificación del proyecto)
- [x] RESUMEN.md (resumen del proyecto)

## Próximos Pasos Post-Instalación

### Antes de Ejecutar
- [ ] Cambiar IP en `src/services/config.ts` a tu IP local
- [ ] Asegurar que el backend esté corriendo en el puerto 8080
- [ ] Instalar Expo Go en tu dispositivo móvil

### Instalación
- [ ] `npm install` - Instalar dependencias
- [ ] `npm start` - Iniciar servidor Expo
- [ ] Escanear código QR con Expo Go

### Testing Inicial
- [ ] Verificar que lista de productos carga
- [ ] Probar ajuste rápido de stock (+/-)
- [ ] Crear un nuevo producto
- [ ] Editar un producto
- [ ] Buscar cartas en Scryfall

## Solución de Problemas

### "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Error: connect ECONNREFUSED"
- Backend no está corriendo
- Verificar IP en `src/services/config.ts`

### Expo Go no conecta
- Asegurar que dispositivo y computadora estén en la misma red
- Verificar firewall/antivirus
- Probar con emulador en lugar de dispositivo físico

## Despliegue

### Build para Producción

#### Con EAS Build (Recomendado)
```bash
# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios
```

#### Build local
```bash
# Build para Android APK
npx expo build:android

# Build para iOS
npx expo build:ios
```

**Requisitos para EAS:**
- Tener cuenta en Expo (https://expo.dev)
- Instalar EAS CLI: `npm install -g eas-cli`
- Estar logueado: `eas login`

### Descargar APK
Al usar `eas build --platform android`, la APK se descarga automáticamente desde la cola de compilación y puede instalarse en tu dispositivo Android.

### Publicar en Expo
```bash
npx expo publish
```

## Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

Este proyecto es privado y propiedad de Magic Field.

---

**Desarrollado con ❤️ para facilitar la administración de productos Magic: The Gathering**
