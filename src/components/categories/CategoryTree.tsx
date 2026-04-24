import { Text } from '@mantine/core'
import {
  IconTrash,
  IconChevronDown,
  IconChevronRight,
  IconPencil,
  IconFolder,
  IconFolderOpen,
} from '@tabler/icons-react'
import { useState } from 'react'

interface NodeProps {
  node: CategoryNode
  onDelete: (category: Category) => void
  onEdit: (category: Category) => void
}

interface CategoryTreeProps {
  tree: CategoryNode[]
  onDelete: (category: Category) => void
  onEdit: (category: Category) => void
}

// ── Child (level 2) ───────────────────────────────────────────────────────────

function ChildNode({ node, onDelete, onEdit }: NodeProps) {
  return (
    <div className="cat-child">
      <div className="cat-node__left">
        <span className="cat-dot" />
        <span>{node.name}</span>
      </div>
      <div className="cat-actions">
        <button
          className="cat-action-btn cat-action-btn--edit"
          onClick={() => onEdit(node)}
          aria-label="Chỉnh sửa"
        >
          <IconPencil size={12} />
        </button>
        <button
          className="cat-action-btn cat-action-btn--delete"
          onClick={() => onDelete(node)}
          aria-label="Xoá"
        >
          <IconTrash size={12} />
        </button>
      </div>
    </div>
  )
}

// ── Root (level 1) ────────────────────────────────────────────────────────────

function RootNode({ node, onDelete, onEdit }: NodeProps) {
  const [open, setOpen] = useState(false)
  const hasChildren = (node.children?.length ?? 0) > 0

  return (
    <div className="cat-node">
      <div className="cat-node__header">
        <div className="cat-node__left">
          <button
            className="cat-toggle cat-toggle--root"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Thu gọn' : 'Mở rộng'}
          >
            {open ? (
              <IconChevronDown size={14} />
            ) : (
              <IconChevronRight size={14} />
            )}
          </button>

          <span className="cat-folder-icon">
            {open && hasChildren ? (
              <IconFolderOpen size={15} />
            ) : (
              <IconFolder size={15} />
            )}
          </span>

          <span className="cat-node__name">{node.name}</span>

          {hasChildren && (
            <span className="cat-count">{node.children!.length}</span>
          )}
        </div>

        <div className="cat-actions">
          <button
            className="cat-action-btn cat-action-btn--edit"
            onClick={() => onEdit(node)}
            aria-label="Chỉnh sửa"
          >
            <IconPencil size={13} />
          </button>
          <button
            className="cat-action-btn cat-action-btn--delete"
            onClick={() => onDelete(node)}
            aria-label="Xoá"
          >
            <IconTrash size={13} />
          </button>
        </div>
      </div>

      {open && hasChildren && (
        <div className="cat-node__children">
          {node.children!.map((child) => (
            <ChildNode
              key={child.id}
              node={child}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Tree ──────────────────────────────────────────────────────────────────────

export default function CategoryTree({
  tree,
  onDelete,
  onEdit,
}: CategoryTreeProps) {
  if (!tree?.length) {
    return (
      <div className="empty-state">
        <IconFolder size={40} color="#d1d5db" />
        <Text>Chưa có danh mục nào</Text>
      </div>
    )
  }

  return (
    <div className="cat-tree">
      {tree.map((root) => (
        <RootNode
          key={root.id}
          node={root}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}
