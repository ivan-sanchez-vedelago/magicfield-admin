import { Category } from '@types';

// shortName es único por categoría -- un producto sellado nunca tiene category.shortName ===
// "PSL" directamente, sino el de su subcategoría hoja (ej. "PRE" bajo Sellados, creada a mano
// desde el árbol del admin), y puede haber más de un nivel de anidamiento en el medio (en este
// catálogo real, "Singles"/"Sellados" cuelgan de "Magic the gathering", no de la raíz
// directamente -- asumir un solo nivel fue el bug original). Sube por parentId hasta encontrar
// targetShortName en algún ancestro (o en la propia categoría).
//
// La categoría raíz real está auto-referenciada (su propio parentId apunta a su propio id, en
// vez de no tener padre) -- sin el corte de "parent.id === current.id" de abajo, cualquier
// categoría fuera de la rama buscada (ej. accesorios buscando "SIN") recorrería en loop
// infinito. Mismo criterio que Category.isDescendantOfOrSelf en el backend.
export function isDescendantOfOrSelf(
  category: Category,
  targetShortName: string,
  categories: Category[]
): boolean {
  let current: Category | undefined = category;
  while (current) {
    if (current.shortName === targetShortName) return true;
    const parent = categories.find(c => c.id === current!.parentId);
    if (!parent || parent.id === current.id) return false;
    current = parent;
  }
  return false;
}
