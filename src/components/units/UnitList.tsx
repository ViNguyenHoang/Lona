import { Text } from '@mantine/core'
import { IconTrash, IconPencil, IconRuler } from '@tabler/icons-react'

interface UnitListProps {
  units: Unit[]
  onDelete: (unit: Unit) => void
  onEdit: (unit: Unit) => void
}

function UnitRow({
  unit,
  onDelete,
  onEdit,
}: {
  unit: Unit
  onDelete: (unit: Unit) => void
  onEdit: (unit: Unit) => void
}) {
  return (
    <div className="unit-row">
      <div className="unit-row__left">
        <span className="unit-icon">
          <IconRuler size={13} />
        </span>
        <span className="unit-row__name">{unit.name}</span>
      </div>
      <div className="cat-actions">
        <button
          className="cat-action-btn cat-action-btn--edit"
          onClick={() => onEdit(unit)}
          aria-label="Chỉnh sửa"
        >
          <IconPencil size={13} />
        </button>
        <button
          className="cat-action-btn cat-action-btn--delete"
          onClick={() => onDelete(unit)}
          aria-label="Xoá"
        >
          <IconTrash size={13} />
        </button>
      </div>
    </div>
  )
}

export default function UnitList({ units, onDelete, onEdit }: UnitListProps) {
  if (!units?.length) {
    return (
      <div className="empty-state">
        <IconRuler size={40} color="#d1d5db" />
        <Text>Chưa có đơn vị nào</Text>
      </div>
    )
  }

  return (
    <div className="unit-list">
      {units.map((unit) => (
        <UnitRow key={unit.id} unit={unit} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </div>
  )
}
