export const PRICE_MIN = 0
export const PRICE_MAX = 2_000_000
export const PRICE_STEP = 10_000

export interface ProductFilterState {
  unitId: string | null
  priceRange: [number, number]
}

export const DEFAULT_FILTERS: ProductFilterState = {
  unitId: null,
  priceRange: [PRICE_MIN, PRICE_MAX],
}

export type SortOrder = 'none' | 'price-asc' | 'price-desc'

export function isDefaultFilters(f: ProductFilterState): boolean {
  return (
    f.unitId === null &&
    f.priceRange[0] === PRICE_MIN &&
    f.priceRange[1] === PRICE_MAX
  )
}

export function activeFilterCount(f: ProductFilterState): number {
  let n = 0
  if (f.unitId) n += 1
  if (f.priceRange[0] !== PRICE_MIN || f.priceRange[1] !== PRICE_MAX) n += 1
  return n
}

export function applyProductFilters(
  products: Product[],
  f: ProductFilterState,
): Product[] {
  const [minPrice, maxPrice] = f.priceRange
  return products.filter((p) => {
    if (f.unitId && p.unit_id !== f.unitId) return false
    if (p.price < minPrice || p.price > maxPrice) return false
    return true
  })
}

export function applyCategoryFilter(
  products: Product[],
  categoryId: string | null,
): Product[] {
  if (!categoryId) return products
  return products.filter((p) =>
    p.product_categories.some((pc) => pc.category_id === categoryId),
  )
}

export function applySortOrder(
  products: Product[],
  order: SortOrder,
): Product[] {
  if (order === 'none') return products
  return [...products].sort((a, b) =>
    order === 'price-asc' ? a.price - b.price : b.price - a.price,
  )
}

export function formatVnd(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ'
}
