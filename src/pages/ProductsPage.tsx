import { useState } from 'react'
import { TextInput, Loader, Center } from '@mantine/core'
import {
  IconBuildingStore,
  IconSearch,
  IconLayoutGrid,
} from '@tabler/icons-react'
import Layout from '../components/shared/Layout.js'
import ProductCard from '../components/search/ProductCard.js'
import { useProducts } from '../hooks/useProducts.js'

export default function ProductsPage() {
  const { products, loading } = useProducts()
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : products

  return (
    <Layout
      title="Danh Sách Sản Phẩm"
      subtitle="Xem giá và tìm kiếm sản phẩm"
      icon={IconBuildingStore}
    >
      <div className="products-page">
        <TextInput
          placeholder="Tìm tên sản phẩm..."
          leftSection={<IconSearch size={15} />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          mb="md"
          styles={{
            input: { fontFamily: 'var(--font)', borderColor: 'var(--border)' },
          }}
        />

        <div className="section-title">
          <IconLayoutGrid size={16} />
          Tất cả sản phẩm
          <span className="count-badge">{loading ? '…' : filtered.length}</span>
        </div>

        {loading ? (
          <Center py={40}>
            <Loader color="green" size="sm" />
          </Center>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>
              {query ? `Không tìm thấy "${query}"` : 'Chưa có sản phẩm nào'}
            </p>
          </div>
        ) : (
          <div className="p-grid">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} mode="browse" />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
