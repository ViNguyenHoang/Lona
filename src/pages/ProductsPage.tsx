import { useEffect, useState } from 'react'
import { TextInput, Loader, Center, Group, Pagination } from '@mantine/core'
import {
  IconSearch,
  IconLayoutGrid,
  IconCategory,
  IconX,
} from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import Layout from '../components/shared/Layout.js'
import ProductCard from '../components/search/ProductCard.js'
import {
  ProductFilterButton,
  ProductFilterPanel,
} from '../components/products/ProductFilters.js'
import { SortPriceButton } from '../components/products/SortPriceButton.js'
import { CategoryDrawer } from '../components/products/CategoryDrawer.js'
import {
  DEFAULT_FILTERS,
  applyCategoryFilter,
  applyProductFilters,
  applySortOrder,
  type ProductFilterState,
  type SortOrder,
} from '../lib/productFilters.js'
import { useProducts } from '../hooks/useProducts.js'
import { useCategories } from '../hooks/useCategories.js'
import { useUnits } from '../hooks/useUnits.js'

export default function ProductsPage() {
  const { products, loading } = useProducts({ priceGreaterThan: 0 })
  const { categories } = useCategories()
  const { units } = useUnits()

  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<ProductFilterState>(DEFAULT_FILTERS)
  const [filtersOpen, { toggle: toggleFilters }] = useDisclosure(false)
  const [sort, setSort] = useState<SortOrder>('none')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [catDrawerOpen, { open: openCatDrawer, close: closeCatDrawer }] =
    useDisclosure(false)

  const byCategory = applyCategoryFilter(products, categoryId)
  const byFilters = applyProductFilters(byCategory, filters)
  const sorted = applySortOrder(byFilters, sort)
  const filtered = query.trim()
    ? sorted.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : sorted

  const activeCategory = categoryId
    ? categories.find((c) => c.id === categoryId)
    : null

  // ── Pagination ────────────────────────────────────────────────────────────
  const PAGE_SIZE = 20
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [query, filters, sort, categoryId])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE)

  return (
    <Layout
      title="Danh Sách Sản Phẩm"
      subtitle="Xem giá và tìm kiếm sản phẩm"
    >
      <div className="products-page">
        <Group gap={8} mb={12}>
          <TextInput
            placeholder="Tìm tên sản phẩm..."
            leftSection={<IconSearch size={15} />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1 }}
            styles={{
              input: {
                fontFamily: 'var(--font)',
                borderColor: 'var(--border)',
              },
            }}
          />
          <button
            type="button"
            className={`cat-trigger${categoryId ? ' cat-trigger--active' : ''}`}
            onClick={openCatDrawer}
            aria-label="Danh mục"
          >
            <IconCategory size={20} />
          </button>
        </Group>

        <div className="toolbar-pills">
          <SortPriceButton value={sort} onChange={setSort} />
          <ProductFilterButton
            filters={filters}
            open={filtersOpen}
            onToggle={toggleFilters}
          />
        </div>

        <ProductFilterPanel
          open={filtersOpen}
          filters={filters}
          onChange={setFilters}
          units={units}
        />

        {activeCategory && (
          <div>
            <span className="cat-chip">
              Danh mục: {activeCategory.name}
              <button
                type="button"
                className="cat-chip__close"
                onClick={() => setCategoryId(null)}
                aria-label="Bỏ chọn danh mục"
              >
                <IconX size={11} />
              </button>
            </span>
          </div>
        )}

        <div className="section-title">
          <IconLayoutGrid size={16} />
          {activeCategory ? activeCategory.name : 'Tất cả sản phẩm'}
          <span className="count-badge">{loading ? '…' : filtered.length}</span>
        </div>

        {loading ? (
          <Center py={40}>
            <Loader color="teal" size="sm" />
          </Center>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>
              {query ? `Không tìm thấy "${query}"` : 'Chưa có sản phẩm nào'}
            </p>
          </div>
        ) : (
          <>
            <div className="p-grid">
              {pageItems.map((p) => (
                <ProductCard key={p.id} product={p} mode="browse" />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="pagination-wrap">
                <Pagination
                  total={totalPages}
                  value={currentPage}
                  onChange={setPage}
                  size="sm"
                  color="teal"
                  radius="xl"
                  withEdges
                  siblings={1}
                  styles={{ control: { fontFamily: 'var(--font)' } }}
                />
              </div>
            )}
          </>
        )}

        <CategoryDrawer
          open={catDrawerOpen}
          onClose={closeCatDrawer}
          categories={categories}
          selectedId={categoryId}
          onSelect={setCategoryId}
        />
      </div>
    </Layout>
  )
}
