import { IconMoodEmpty } from '@tabler/icons-react'
import ProductCard from './ProductCard'
import type { SearchProduct } from '../../hooks/useSearch'

interface SearchResultProps {
  results: SearchProduct[]
  loading: boolean
  query: string
  parsedName: string | null
}

export default function SearchResult({
  results,
  loading,
  query,
  parsedName,
}: SearchResultProps) {
  if (loading) {
    return (
      <div className="result-area">
        <div className="spinner-wrap">
          <div className="spinner" />
        </div>
      </div>
    )
  }

  if (!query) return null

  if (results.length === 0) {
    return (
      <div className="result-area">
        <div className="empty-state">
          <IconMoodEmpty size={40} />
          <p>Không tìm thấy "{query}"</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: 360 }}>
      {parsedName && (
        <div className="parsed-badge" style={{ marginBottom: 12 }}>
          🔍 {parsedName} · <span>{results.length} kết quả</span>
        </div>
      )}

      <div className="result-grid">
        {results.map((p) => (
          <ProductCard key={p.id} product={p} mode="browse" />
        ))}
      </div>
    </div>
  )
}
