import { Category } from '@types';

// Extraído de CreateProductScreen.tsx (antes "findRoot", declarado ahí solo) para poder
// reusarlo desde EditProductScreen/ProductCard/ProductDetailScreen: sube por parentId hasta
// la categoría de primer nivel (parentId === 0), sin importar cuántas subcategorías hoja se
// hayan creado a mano desde el árbol del admin (ej. "Precons" bajo Sellados). shortName de una
// hoja NUNCA es literalmente "SIN"/"PSL"/"ACC" -- solo el de la raíz lo es.
export function findRootCategory(category: Category, categories: Category[]): Category {
  if (category.parentId === 0) return category;
  const parent = categories.find(c => c.id === category.parentId);
  return parent ? findRootCategory(parent, categories) : category;
}

// Azúcar para el caso común "¿esta categoría (id o shortName) cuelga de esta raíz?".
export function resolveRootShortName(
  categoryIdOrShortName: number | string,
  categories: Category[]
): string | null {
  const leaf = typeof categoryIdOrShortName === 'number'
    ? categories.find(c => c.id === categoryIdOrShortName)
    : categories.find(c => c.shortName === categoryIdOrShortName);
  return leaf ? findRootCategory(leaf, categories).shortName : null;
}
