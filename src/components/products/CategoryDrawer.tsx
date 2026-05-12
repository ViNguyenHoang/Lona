import { Drawer, ScrollArea, Text } from '@mantine/core'
import { IconChevronRight, IconLayoutGrid } from '@tabler/icons-react'

interface Props {
  open: boolean
  onClose: () => void
  categories: Category[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

interface Node extends Category {
  children: Node[]
}

function buildTree(flat: Category[]): Node[] {
  const map: Record<string, Node> = {}
  const roots: Node[] = []

  flat
    .filter((c) => c.parent_id === null)
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    .forEach((c) => {
      map[c.id] = { ...c, children: [] }
      roots.push(map[c.id])
    })

  flat
    .filter((c) => c.parent_id !== null)
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    .forEach((c) => {
      if (c.parent_id && map[c.parent_id]) {
        map[c.parent_id].children.push({ ...c, children: [] })
      }
    })

  return roots
}

export function CategoryDrawer({
  open,
  onClose,
  categories,
  selectedId,
  onSelect,
}: Props) {
  const tree = buildTree(categories)

  function handleSelect(id: string | null) {
    onSelect(id)
    onClose()
  }

  return (
    <Drawer
      opened={open}
      onClose={onClose}
      title={
        <Text fw={800} fz="md" ff="var(--font)">
          Danh mục
        </Text>
      }
      position="left"
      size="xs"
      styles={{
        content: { fontFamily: 'var(--font)' },
        header: { borderBottom: '1px solid var(--border)' },
      }}
    >
      <ScrollArea h="calc(100vh - 80px)" type="auto">
        <button
          type="button"
          className={`cat-item cat-item--all${
            selectedId === null ? ' cat-item--active' : ''
          }`}
          onClick={() => handleSelect(null)}
        >
          <IconLayoutGrid size={16} />
          <span>Tất cả sản phẩm</span>
        </button>

        {tree.length === 0 && (
          <div className="cat-empty">
            <Text fz="sm" c="dimmed" ff="var(--font)">
              Chưa có danh mục
            </Text>
          </div>
        )}

        {tree.map((node) => (
          <div key={node.id} className="cat-group">
            <button
              type="button"
              className={`cat-item cat-item--root${
                selectedId === node.id ? ' cat-item--active' : ''
              }`}
              onClick={() => handleSelect(node.id)}
            >
              <span>{node.name}</span>
              {node.children.length > 0 && <IconChevronRight size={14} />}
            </button>
            {node.children.map((child) => (
              <button
                key={child.id}
                type="button"
                className={`cat-item cat-item--child${
                  selectedId === child.id ? ' cat-item--active' : ''
                }`}
                onClick={() => handleSelect(child.id)}
              >
                <span>{child.name}</span>
              </button>
            ))}
          </div>
        ))}
      </ScrollArea>
    </Drawer>
  )
}
