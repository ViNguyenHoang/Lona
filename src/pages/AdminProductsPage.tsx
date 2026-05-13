import { useEffect, useState } from 'react'
import {
  TextInput,
  Button,
  Group,
  Text,
  Modal,
  Loader,
  Center,
  Pagination,
} from '@mantine/core'
import {
  IconSearch,
  IconPlus,
  IconCategory,
  IconX,
} from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useDisclosure } from '@mantine/hooks'
import ProductCard from '../components/search/ProductCard'
import ProductForm from '../components/products/ProductForm'
import ProductsTable from '../components/products/ProductsTable'
import ImportExportMenu from '../components/products/ImportExportMenu'
import BulkActionsBar from '../components/products/BulkActionsBar'
import BulkPriceModal from '../components/products/BulkPriceModal'
import {
  ProductFilterButton,
  ProductFilterPanel,
} from '../components/products/ProductFilters'
import { SortPriceButton } from '../components/products/SortPriceButton'
import { CategoryDrawer } from '../components/products/CategoryDrawer'
import {
  DEFAULT_FILTERS,
  applyCategoryFilter,
  applyProductFilters,
  applySortOrder,
  type ProductFilterState,
  type SortOrder,
} from '../lib/productFilters'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { useUnits } from '../hooks/useUnits'
import LayoutAdmin from '../components/shared/LayoutAdmin'

export default function AdminProductsPage() {
  const {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    deleteAllProducts,
    bulkAddProducts,
    bulkDeleteProducts,
    bulkUpdatePrices,
  } = useProducts()
  const { categories } = useCategories()
  const { units } = useUnits()

  const [query, setQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [filters, setFilters] = useState<ProductFilterState>(DEFAULT_FILTERS)
  const [filtersOpen, { toggle: toggleFilters }] = useDisclosure(false)
  const [sort, setSort] = useState<SortOrder>('none')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [catDrawerOpen, { open: openCatDrawer, close: closeCatDrawer }] =
    useDisclosure(false)

  const [modalForm, { open: openModalForm, close: closeModalForm }] =
    useDisclosure(false)
  const [modalDelete, { open: openModalDelete, close: closeModalDelete }] =
    useDisclosure(false)
  const [isDeleting, setDeleting] = useState(false)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [modalBulkDelete, bulkDeleteModal] = useDisclosure(false)
  const [modalBulkPrice, bulkPriceModal] = useDisclosure(false)
  const [isBulkDeleting, setBulkDeleting] = useState(false)

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

  // ── Handlers ──────────────────────────────────────────────────────────────

  function onOpenAdd() {
    setSelectedProduct(null)
    openModalForm()
  }

  function onOpenEdit(product: Product) {
    setSelectedProduct(product)
    openModalForm()
  }

  function onOpenDelete(product: Product) {
    setSelectedProduct(product)
    openModalDelete()
  }

  function onCloseModalForm() {
    setSelectedProduct(null)
    closeModalForm()
  }

  function onCloseModalDelete() {
    setSelectedProduct(null)
    closeModalDelete()
  }

  async function handleSubmit(
    formData: ProductFormCreate | ProductFormUpdate,
  ): Promise<void> {
    try {
      if ('id' in formData) {
        await updateProduct(formData)
        notifications.show({ message: 'Cập nhật thành công!', color: 'green' })
      } else {
        await addProduct(formData)
        notifications.show({
          message: 'Thêm sản phẩm thành công!',
          color: 'green',
        })
      }
    } catch (err) {
      notifications.show({
        message:
          'Lỗi: ' + (err instanceof Error ? err.message : 'Không xác định'),
        color: 'red',
      })
      throw err
    }
  }

  async function handleDelete(): Promise<void> {
    if (!selectedProduct) return
    setDeleting(true)
    try {
      await deleteProduct(selectedProduct.id)
      notifications.show({ message: 'Đã xoá sản phẩm', color: 'green' })
      onCloseModalDelete()
    } catch (err) {
      notifications.show({
        message:
          'Lỗi: ' + (err instanceof Error ? err.message : 'Không xác định'),
        color: 'red',
      })
    } finally {
      setDeleting(false)
    }
  }

  // ── Selection ─────────────────────────────────────────────────────────────

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAllVisible() {
    setSelectedIds((prev) => {
      const allVisibleSelected =
        pageItems.length > 0 && pageItems.every((p) => prev.has(p.id))
      const next = new Set(prev)
      if (allVisibleSelected) {
        pageItems.forEach((p) => next.delete(p.id))
      } else {
        pageItems.forEach((p) => next.add(p.id))
      }
      return next
    })
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  async function handleBulkDelete(): Promise<void> {
    if (selectedIds.size === 0) return
    setBulkDeleting(true)
    try {
      const { deleted } = await bulkDeleteProducts(Array.from(selectedIds))
      notifications.show({
        message: `Đã xoá ${deleted} sản phẩm`,
        color: 'green',
      })
      clearSelection()
      bulkDeleteModal.close()
    } catch (err) {
      notifications.show({
        message:
          'Lỗi: ' + (err instanceof Error ? err.message : 'Không xác định'),
        color: 'red',
      })
    } finally {
      setBulkDeleting(false)
    }
  }

  async function handleBulkUpdatePrices(
    updates: { id: string; price: number }[],
  ): Promise<void> {
    try {
      const { updated } = await bulkUpdatePrices(updates)
      notifications.show({
        message: `Đã cập nhật giá ${updated} sản phẩm`,
        color: 'green',
      })
      clearSelection()
    } catch (err) {
      notifications.show({
        message:
          'Lỗi: ' + (err instanceof Error ? err.message : 'Không xác định'),
        color: 'red',
      })
      throw err
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <LayoutAdmin title="Quản Lý Sản Phẩm" subtitle="Thêm, sửa, xoá sản phẩm">
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
        <ImportExportMenu
          products={products}
          onBulkAdd={bulkAddProducts}
          onDeleteAll={deleteAllProducts}
        />
        <button
          className="add-btn"
          onClick={onOpenAdd}
          aria-label="Thêm sản phẩm"
        >
          <IconPlus size={20} />
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

      {!loading && (
        <div className="product-stats">
          <span>Tổng sản phẩm:</span>
          <span className="stat-value">{products.length}</span>
          {filtered.length !== products.length && (
            <span className="stat-filtered">· Hiển thị: {filtered.length}</span>
          )}
        </div>
      )}

      {loading ? (
        <Center py={40}>
          <Loader color="teal" size="sm" />
        </Center>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>
            {query
              ? `Không tìm thấy "${query}"`
              : 'Chưa có sản phẩm — nhấn + để thêm'}
          </p>
        </div>
      ) : (
        <>
          <div className="admin-grid-wrap">
            <div className="product-grid">
              {pageItems.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  mode="admin"
                  onEdit={onOpenEdit}
                  onDelete={onOpenDelete}
                />
              ))}
            </div>
          </div>
          <div className="admin-table-wrap">
            <ProductsTable
              products={pageItems}
              categories={categories}
              onEdit={onOpenEdit}
              onDelete={onOpenDelete}
              selectedIds={selectedIds}
              onToggleOne={toggleOne}
              onToggleAll={toggleAllVisible}
            />
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

      <BulkActionsBar
        count={selectedIds.size}
        onClear={clearSelection}
        onEditPrice={bulkPriceModal.open}
        onDelete={bulkDeleteModal.open}
      />

      <CategoryDrawer
        open={catDrawerOpen}
        onClose={closeCatDrawer}
        categories={categories}
        selectedId={categoryId}
        onSelect={setCategoryId}
      />

      {/* Add / Edit form */}
      <ProductForm
        open={modalForm}
        onClose={onCloseModalForm}
        onSubmit={handleSubmit}
        product={selectedProduct}
        units={units}
        categories={categories}
      />

      {/* Delete confirm */}
      <Modal
        opened={modalDelete}
        onClose={onCloseModalDelete}
        title={
          <Text fw={800} fz="md" ff="var(--font)">
            Xác nhận xoá
          </Text>
        }
        centered
        styles={{ content: { fontFamily: 'var(--font)', borderRadius: 16 } }}
      >
        <Text fz="sm" mb="lg" ff="var(--font)">
          Xoá sản phẩm <strong>"{selectedProduct?.name}"</strong>? Hành động này
          không thể hoàn tác.
        </Text>
        <Group gap={8}>
          <Button
            variant="default"
            flex={1}
            onClick={onCloseModalDelete}
            styles={{ root: { fontFamily: 'var(--font)', fontWeight: 700 } }}
          >
            Huỷ
          </Button>
          <Button
            color="red"
            flex={1}
            loading={isDeleting}
            onClick={handleDelete}
            styles={{ root: { fontFamily: 'var(--font)', fontWeight: 800 } }}
          >
            Xoá
          </Button>
        </Group>
      </Modal>

      {/* Bulk delete confirm */}
      <Modal
        opened={modalBulkDelete}
        onClose={bulkDeleteModal.close}
        title={
          <Text fw={800} fz="md" ff="var(--font)">
            Xác nhận xoá hàng loạt
          </Text>
        }
        centered
        styles={{ content: { fontFamily: 'var(--font)', borderRadius: 16 } }}
      >
        <Text fz="sm" mb="lg" ff="var(--font)">
          Xoá <strong>{selectedIds.size}</strong> sản phẩm đã chọn? Hành động
          này không thể hoàn tác.
        </Text>
        <Group gap={8}>
          <Button
            variant="default"
            flex={1}
            onClick={bulkDeleteModal.close}
            styles={{ root: { fontFamily: 'var(--font)', fontWeight: 700 } }}
          >
            Huỷ
          </Button>
          <Button
            color="red"
            flex={1}
            loading={isBulkDeleting}
            onClick={handleBulkDelete}
            styles={{ root: { fontFamily: 'var(--font)', fontWeight: 800 } }}
          >
            Xoá {selectedIds.size}
          </Button>
        </Group>
      </Modal>

      {/* Bulk price */}
      <BulkPriceModal
        open={modalBulkPrice}
        onClose={bulkPriceModal.close}
        products={products}
        selectedIds={selectedIds}
        onRemove={toggleOne}
        onSubmit={handleBulkUpdatePrices}
      />
    </LayoutAdmin>
  )
}
