import { parseCsv, serializeCsv } from './csv'

export type ProductCsvField = 'image' | 'category' | 'unit'

export const PRODUCT_CSV_FIELDS: ProductCsvField[] = [
  'image',
  'category',
  'unit',
]

export const PRODUCT_CSV_FIELD_LABELS: Record<ProductCsvField, string> = {
  image: 'Hình ảnh (image_url, image_public_id)',
  category: 'Danh mục (category_id)',
  unit: 'Đơn vị (unit_id)',
}

export interface ParsedProductRow {
  line: number
  name: string
  price: number
  image_url: string | null
  image_public_id: string | null
  unit_id: string | null
  categoryIds: string[]
}

export interface ParseResult {
  rows: ParsedProductRow[]
  errors: { line: number; message: string }[]
}

// ── Export ────────────────────────────────────────────────────────────────────

export function productsToCsv(
  products: Product[],
  fields: ProductCsvField[],
): string {
  const headers: string[] = ['name', 'price']
  if (fields.includes('image')) headers.push('image_url', 'image_public_id')
  if (fields.includes('category')) headers.push('categories')
  if (fields.includes('unit')) headers.push('unit_id')

  const rows: string[][] = [headers]
  for (const p of products) {
    const row: string[] = [p.name, String(p.price)]
    if (fields.includes('image')) {
      row.push(p.image_url ?? '', p.image_public_id ?? '')
    }
    if (fields.includes('category')) {
      row.push(p.product_categories.map((c) => c.category_id).join('|'))
    }
    if (fields.includes('unit')) {
      row.push(p.unit_id ?? '')
    }
    rows.push(row)
  }
  return serializeCsv(rows)
}

// ── Import ────────────────────────────────────────────────────────────────────

export function parseProductsCsv(
  text: string,
  fields: ProductCsvField[],
): ParseResult {
  const grid = parseCsv(text)
  const result: ParseResult = { rows: [], errors: [] }

  if (grid.length === 0) {
    result.errors.push({ line: 0, message: 'File CSV trống' })
    return result
  }

  const header = grid[0].map((h) => h.trim().toLowerCase())
  const idx = {
    name: header.indexOf('name'),
    price: header.indexOf('price'),
    image_url: header.indexOf('image_url'),
    image_public_id: header.indexOf('image_public_id'),
    categories: header.indexOf('categories'),
    unit_id: header.indexOf('unit_id'),
  }

  if (idx.name < 0 || idx.price < 0) {
    result.errors.push({
      line: 1,
      message: 'Thiếu cột bắt buộc "name" hoặc "price"',
    })
    return result
  }

  const missing: string[] = []
  if (fields.includes('image')) {
    if (idx.image_url < 0) missing.push('image_url')
    if (idx.image_public_id < 0) missing.push('image_public_id')
  }
  if (fields.includes('category') && idx.categories < 0) {
    missing.push('categories')
  }
  if (fields.includes('unit') && idx.unit_id < 0) {
    missing.push('unit_id')
  }
  if (missing.length > 0) {
    result.errors.push({
      line: 1,
      message: `Thiếu cột tuỳ chọn đã chọn: ${missing.join(', ')}`,
    })
  }

  for (let i = 1; i < grid.length; i++) {
    const line = i + 1
    const row = grid[i]
    const name = (row[idx.name] ?? '').trim()
    const priceStr = (row[idx.price] ?? '').trim()

    if (!name) {
      result.errors.push({ line, message: 'Thiếu tên sản phẩm' })
      continue
    }

    const price = priceStr === '' ? 0 : Number(priceStr.replace(/[,\s]/g, ''))
    if (!Number.isFinite(price) || price < 0) {
      result.errors.push({ line, message: `Giá không hợp lệ: "${priceStr}"` })
      continue
    }

    let image_url: string | null = null
    let image_public_id: string | null = null
    let unit_id: string | null = null
    let categoryIds: string[] = []

    if (fields.includes('image')) {
      if (idx.image_url >= 0) {
        image_url = (row[idx.image_url] ?? '').trim() || null
      }
      if (idx.image_public_id >= 0) {
        image_public_id = (row[idx.image_public_id] ?? '').trim() || null
      }
    }
    if (fields.includes('unit') && idx.unit_id >= 0) {
      unit_id = (row[idx.unit_id] ?? '').trim() || null
    }
    if (fields.includes('category') && idx.categories >= 0) {
      const v = (row[idx.categories] ?? '').trim()
      categoryIds = v
        ? v
            .split('|')
            .map((s) => s.trim())
            .filter(Boolean)
        : []
    }

    result.rows.push({
      line,
      name,
      price,
      image_url,
      image_public_id,
      unit_id,
      categoryIds,
    })
  }

  return result
}
