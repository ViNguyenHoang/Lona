import { useState } from 'react'
import {
  Group,
  Text,
  Loader,
  Center,
  Modal,
  Button,
  TextInput,
} from '@mantine/core'
import { IconCategory2, IconPlus, IconSearch, IconFolder } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import CategoryTree from '../components/categories/CategoryTree'
import CategoryForm from '../components/categories/CategoryForm'
import { useCategories } from '../hooks/useCategories'
import { useDisclosure } from '@mantine/hooks'
import LayoutAdmin from '../components/shared/LayoutAdmin'

export default function AdminCategoriesPage() {
  const {
    categories,
    tree,
    selectOptions,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useCategories()

  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  )

  const q = query.trim().toLowerCase()
  const filteredTree = q
    ? tree
        .map((root) => {
          const rootMatch = root.name.toLowerCase().includes(q)
          if (rootMatch) return root
          const matchingChildren = root.children.filter((c) =>
            c.name.toLowerCase().includes(q),
          )
          if (matchingChildren.length > 0)
            return { ...root, children: matchingChildren }
          return null
        })
        .filter((n): n is (typeof tree)[number] => n !== null)
    : tree

  const filteredCount = q
    ? categories.filter((c) => c.name.toLowerCase().includes(q)).length
    : categories.length

  const [modalForm, { open: openModalForm, close: closeModalForm }] =
    useDisclosure(false)
  const [modalDelete, { open: openModalDelete, close: closeModalDelete }] =
    useDisclosure(false)

  const [isDelete, setDelete] = useState(false)

  // ── Helpers ───────────────────────────────────────────────────────────────

  function onOpenAdd() {
    setSelectedCategory(null)
    openModalForm()
  }

  function onOpenEdit(category: Category) {
    setSelectedCategory(category)
    openModalForm()
  }

  function onOpenDelete(category: Category) {
    setSelectedCategory(category)
    openModalDelete()
  }

  function onCloseModalForm() {
    setSelectedCategory(null)
    closeModalForm()
  }

  function onCloseModalDelete() {
    setSelectedCategory(null)
    closeModalDelete()
  }

  // ── Submit handlers ───────────────────────────────────────────────────────

  async function handleAdd(
    data: Parameters<typeof addCategory>[0],
  ): Promise<void> {
    try {
      await addCategory(data)
      notifications.show({ message: 'Đã thêm danh mục!', color: 'green' })
    } catch (err) {
      notifications.show({
        message:
          'Lỗi: ' + (err instanceof Error ? err.message : 'Không xác định'),
        color: 'red',
      })
      throw err
    }
  }

  async function handleUpdate(
    data: Parameters<typeof addCategory>[0],
  ): Promise<void> {
    if (!selectedCategory) return
    try {
      await updateCategory(selectedCategory.id, data)
      notifications.show({ message: 'Đã cập nhật danh mục!', color: 'green' })
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
    if (!selectedCategory) return
    setDelete(true)
    try {
      await deleteCategory(selectedCategory.id)
      notifications.show({ message: 'Đã xoá danh mục', color: 'green' })
      onCloseModalDelete()
    } catch (err) {
      notifications.show({
        message:
          'Lỗi: ' + (err instanceof Error ? err.message : 'Không xác định'),
        color: 'red',
      })
    } finally {
      setDelete(false)
    }
  }

  // ── Delete modal message ──────────────────────────────────────────────────

  const isRootDelete = selectedCategory?.parent_id === null
  const deleteMessage = isRootDelete
    ? `Xoá danh mục "${selectedCategory?.name}" và toàn bộ danh mục con bên trong?`
    : `Xoá danh mục "${selectedCategory?.name}"?`

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <LayoutAdmin
      title="Danh Mục"
      subtitle="Quản lý danh mục sản phẩm"
      icon={IconCategory2}
    >
      <Group gap={8} mb={12}>
        <TextInput
          placeholder="Tìm danh mục..."
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
          aria-label="Thêm danh mục"
        >
          <IconPlus size={20} />
        </button>
      </Group>

      {!loading && (
        <div className="product-stats">
          <span>Tổng danh mục:</span>
          <span className="stat-value">{categories.length}</span>
          {filteredCount !== categories.length && (
            <span className="stat-filtered">
              · Hiển thị: {filteredCount}
            </span>
          )}
        </div>
      )}

      {loading ? (
        <Center py={40}>
          <Loader color="teal" size="sm" />
        </Center>
      ) : q && filteredTree.length === 0 ? (
        <div className="empty-state">
          <IconFolder size={40} color="#d1d5db" />
          <Text>Không tìm thấy "{query}"</Text>
        </div>
      ) : (
        <CategoryTree
          tree={filteredTree}
          onDelete={onOpenDelete}
          onEdit={onOpenEdit}
          forceOpen={q ? true : undefined}
        />
      )}

      {/* Form thêm / chỉnh sửa */}
      <CategoryForm
        open={modalForm}
        onClose={onCloseModalForm}
        onSubmit={selectedCategory ? handleUpdate : handleAdd}
        categoryOptions={selectOptions}
        initialValues={
          selectedCategory
            ? {
                id: selectedCategory.id,
                name: selectedCategory.name,
                parent_id: selectedCategory.parent_id,
              }
            : undefined
        }
      />

      {/* Modal xác nhận xoá */}
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
          {deleteMessage}
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
            loading={isDelete}
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
