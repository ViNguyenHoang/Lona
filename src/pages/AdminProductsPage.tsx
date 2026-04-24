import { useState } from 'react'
import {
  TextInput,
  Button,
  Group,
  Text,
  Modal,
  Loader,
  Center,
} from '@mantine/core'
import { IconPackage, IconSearch, IconPlus } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { useDisclosure } from '@mantine/hooks'
import ProductCard from '../components/search/ProductCard'
import ProductForm from '../components/products/ProductForm'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { useUnits } from '../hooks/useUnits'
import LayoutAdmin from '../components/shared/LayoutAdmin'

export default function AdminProductsPage() {
  const { products, loading, addProduct, updateProduct, deleteProduct } =
    useProducts()
  const { categories } = useCategories()
  const { units } = useUnits()

  const [query, setQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const [modalForm, { open: openModalForm, close: closeModalForm }] =
    useDisclosure(false)
  const [modalDelete, { open: openModalDelete, close: closeModalDelete }] =
    useDisclosure(false)
  const [isDeleting, setDeleting] = useState(false)

  const filtered = query.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : products

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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <LayoutAdmin
      title="Quản Lý Sản Phẩm"
      subtitle="Thêm, sửa, xoá sản phẩm"
      icon={IconPackage}
    >
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
          className="add-btn"
          onClick={onOpenAdd}
          aria-label="Thêm sản phẩm"
        >
          <IconPlus size={20} />
        </button>
      </Group>

      {loading ? (
        <Center py={40}>
          <Loader color="green" size="sm" />
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
        <div className="product-grid">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              mode="admin"
              onEdit={onOpenEdit}
              onDelete={onOpenDelete}
            />
          ))}
        </div>
      )}

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
    </LayoutAdmin>
  )
}
