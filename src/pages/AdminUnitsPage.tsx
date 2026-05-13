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
import { IconRuler, IconPlus, IconSearch } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import UnitList from '../components/units/UnitList'
import UnitForm from '../components/units/UnitForm'
import { useUnits } from '../hooks/useUnits'
import { useDisclosure } from '@mantine/hooks'
import LayoutAdmin from '../components/shared/LayoutAdmin'

export default function AdminUnitsPage() {
  const { units, loading, addUnit, updateUnit, deleteUnit } = useUnits()

  const [query, setQuery] = useState('')
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)

  const filteredUnits = query.trim()
    ? units.filter((u) => u.name.toLowerCase().includes(query.toLowerCase()))
    : units

  const [modalForm, { open: openModalForm, close: closeModalForm }] =
    useDisclosure(false)
  const [modalDelete, { open: openModalDelete, close: closeModalDelete }] =
    useDisclosure(false)

  const [isDelete, setDelete] = useState(false)

  // ── Helpers ───────────────────────────────────────────────────────────────

  function onOpenAdd() {
    setSelectedUnit(null)
    openModalForm()
  }

  function onOpenEdit(unit: Unit) {
    setSelectedUnit(unit)
    openModalForm()
  }

  function onOpenDelete(unit: Unit) {
    setSelectedUnit(unit)
    openModalDelete()
  }

  function onCloseModalForm() {
    setSelectedUnit(null)
    closeModalForm()
  }

  function onCloseModalDelete() {
    setSelectedUnit(null)
    closeModalDelete()
  }

  // ── Submit handlers ───────────────────────────────────────────────────────

  async function handleAdd(data: UnitFormCreate): Promise<void> {
    try {
      await addUnit(data)
      notifications.show({ message: 'Đã thêm đơn vị!', color: 'green' })
    } catch (err) {
      notifications.show({
        message:
          'Lỗi: ' + (err instanceof Error ? err.message : 'Không xác định'),
        color: 'red',
      })
      throw err
    }
  }

  async function handleUpdate(data: UnitFormCreate): Promise<void> {
    if (!selectedUnit) return
    try {
      await updateUnit(selectedUnit.id, data)
      notifications.show({ message: 'Đã cập nhật đơn vị!', color: 'green' })
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
    if (!selectedUnit) return
    setDelete(true)
    try {
      await deleteUnit(selectedUnit.id)
      notifications.show({ message: 'Đã xoá đơn vị', color: 'green' })
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <LayoutAdmin title="Đơn Vị Tính" subtitle="Quản lý đơn vị tính sản phẩm">
      <Group gap={8} mb={12}>
        <TextInput
          placeholder="Tìm đơn vị..."
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
          aria-label="Thêm đơn vị"
        >
          <IconPlus size={20} />
        </button>
      </Group>

      {!loading && (
        <div className="product-stats">
          <span>Tổng đơn vị:</span>
          <span className="stat-value">{units.length}</span>
          {filteredUnits.length !== units.length && (
            <span className="stat-filtered">
              · Hiển thị: {filteredUnits.length}
            </span>
          )}
        </div>
      )}

      {loading ? (
        <Center py={40}>
          <Loader color="teal" size="sm" />
        </Center>
      ) : filteredUnits.length === 0 ? (
        <div className="empty-state">
          <IconRuler size={40} color="#d1d5db" />
          <Text>
            {query ? `Không tìm thấy "${query}"` : 'Chưa có đơn vị nào'}
          </Text>
        </div>
      ) : (
        <UnitList
          units={filteredUnits}
          onDelete={onOpenDelete}
          onEdit={onOpenEdit}
        />
      )}

      {/* Form thêm / chỉnh sửa */}
      <UnitForm
        open={modalForm}
        onClose={onCloseModalForm}
        onSubmit={selectedUnit ? handleUpdate : handleAdd}
        initialValues={
          selectedUnit
            ? { id: selectedUnit.id, name: selectedUnit.name }
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
          Xoá đơn vị "{selectedUnit?.name}"?
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
