import { Button, Group, Text } from '@mantine/core'
import { IconCash, IconTrash, IconX } from '@tabler/icons-react'

interface BulkActionsBarProps {
  count: number
  onClear: () => void
  onEditPrice: () => void
  onDelete: () => void
}

export default function BulkActionsBar({
  count,
  onClear,
  onEditPrice,
  onDelete,
}: BulkActionsBarProps) {
  if (count === 0) return null

  return (
    <div className="bulk-actions">
      <Group gap={10} wrap="nowrap" align="center">
        <button
          type="button"
          className="bulk-actions__clear"
          onClick={onClear}
          aria-label="Bỏ chọn"
        >
          <IconX size={16} />
        </button>
        <Text
          fz="sm"
          fw={800}
          ff="var(--font)"
          c="var(--text)"
          style={{ whiteSpace: 'nowrap' }}
        >
          Đã chọn {count}
        </Text>
        <div style={{ flex: 1 }} />
        <Button
          variant="light"
          color="teal"
          size="xs"
          leftSection={<IconCash size={14} />}
          onClick={onEditPrice}
          styles={{ root: { fontFamily: 'var(--font)', fontWeight: 700 } }}
        >
          Sửa giá
        </Button>
        <Button
          variant="light"
          color="red"
          size="xs"
          leftSection={<IconTrash size={14} />}
          onClick={onDelete}
          styles={{ root: { fontFamily: 'var(--font)', fontWeight: 700 } }}
        >
          Xoá đã chọn
        </Button>
      </Group>
    </div>
  )
}
