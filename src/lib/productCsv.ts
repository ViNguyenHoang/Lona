import { parseCsv, serializeCsv } from './csv'

export const CSV_HEADERS = ['name', 'price'] as const

export interface ParsedProductRow {
  line: number
  name: string
  price: number
}

export interface ParseResult {
  rows: ParsedProductRow[]
  errors: { line: number; message: string }[]
}

// ── Export ────────────────────────────────────────────────────────────────────

export function productsToCsv(products: Product[]): string {
  const rows: string[][] = [Array.from(CSV_HEADERS)]
  for (const p of products) {
    rows.push([p.name, String(p.price)])
  }
  return serializeCsv(rows)
}

// ── Import ────────────────────────────────────────────────────────────────────

export function parseProductsCsv(text: string): ParseResult {
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
  }

  if (idx.name < 0 || idx.price < 0) {
    result.errors.push({
      line: 1,
      message: 'Thiếu cột bắt buộc "name" hoặc "price"',
    })
    return result
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

    result.rows.push({ line, name, price })
  }

  return result
}
