import { useState } from 'react'
import { supabase } from '../lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

// Kết quả search — map từ view search_products
export interface SearchProduct {
  id: string
  product_name: string
  price: number
  image_url: string | null
  unit_name: string | null
  aliases: string[]
  category_ids: string[]
}

// ─── Parser ───────────────────────────────────────────────────────────────────

const STOP_WORDS = ['mua', 'cho', 'tôi', 'một', 'tìm', 'kiếm', 'lấy', 'bán']

export function parseSearchInput(rawText: string): string {
  let text = rawText.toLowerCase().trim()

  STOP_WORDS.forEach((w) => {
    text = text.replace(new RegExp(`\\b${w}\\b`, 'g'), '')
  })

  text = text.replace(/^\d+\s*/, '')

  return text.trim().replace(/\s+/g, ' ')
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSearch() {
  const [results, setResults] = useState<SearchProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [parsedName, setParsedName] = useState<string | null>(null)

  async function search(rawText: string): Promise<void> {
    if (!rawText.trim()) {
      setResults([])
      return
    }

    setQuery(rawText)
    setLoading(true)
    setError(null)

    try {
      const product_name = parseSearchInput(rawText)
      setParsedName(product_name)

      if (!product_name) {
        setResults([])
        return
      }

      const keyword = `%${product_name}%`

      // Search theo tên sản phẩm
      const { data: nameData, error: nameErr } = await supabase
        .from('search_products')
        .select('*')
        .ilike('product_name', keyword)

      if (nameErr) throw nameErr

      // Search theo alias
      const { data: aliasData, error: aliasErr } = await supabase
        .from('search_products')
        .select('*')
        .contains('aliases', [product_name])

      if (aliasErr) throw aliasErr

      // Merge + dedup theo id
      const merged = [
        ...((nameData as SearchProduct[]) ?? []),
        ...((aliasData as SearchProduct[]) ?? []),
      ]

      const deduped = Array.from(new Map(merged.map((p) => [p.id, p])).values())

      deduped.sort((a, b) => a.product_name.localeCompare(b.product_name, 'vi'))

      setResults(deduped)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function clearResults(): void {
    setResults([])
    setQuery('')
    setParsedName(null)
  }

  return {
    results,
    loading,
    error,
    query,
    parsedName,
    search,
    clearResults,
  }
}
