import { IconMicrophone } from '@tabler/icons-react'
import Layout from '../components/shared/Layout.js'
import SearchBar from '../components/search/SearchBar.js'
import SearchResult from '../components/search/SearchResult.js'
import { useSearch } from '../hooks/useSearch.js'

export default function SearchPage() {
  const { results, loading, query, parsedName, search } = useSearch()

  return (
    <Layout
      title="Shop Tạp Hóa"
      subtitle="Tìm sản phẩm bằng giọng nói"
      icon={IconMicrophone}
    >
      <div className="search-page">
        <div className="search-hero">
          <div className="search-hero__title">Hỏi giá sản phẩm</div>
          <div className="search-hero__sub">
            Nhấn nút micro và nói tên sản phẩm
          </div>
        </div>

        <SearchBar onSearch={search} />

        <SearchResult
          results={results}
          loading={loading}
          query={query}
          parsedName={parsedName}
        />
      </div>
    </Layout>
  )
}
