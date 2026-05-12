import { Table, ActionIcon, Group, Tooltip } from '@mantine/core'
import { IconPencil, IconTrash, IconPhoto } from '@tabler/icons-react'

interface ProductsTableProps {
  products: Product[]
  categories: Category[]
  onEdit: (p: Product) => void
  onDelete: (p: Product) => void
}

function formatPrice(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ'
}

export default function ProductsTable({
  products,
  categories,
  onEdit,
  onDelete,
}: ProductsTableProps) {
  const catMap = new Map(categories.map((c) => [c.id, c.name]))

  return (
    <div className="product-table-wrap">
      <Table
        striped
        withRowBorders
        highlightOnHover
        verticalSpacing="sm"
        horizontalSpacing="md"
        styles={{
          table: { fontFamily: 'var(--font)' },
          th: {
            fontFamily: 'var(--font)',
            fontWeight: 800,
            color: 'var(--text-2)',
            fontSize: '0.78rem',
            textTransform: 'uppercase',
            letterSpacing: 0.3,
          },
          td: { fontFamily: 'var(--font)', fontSize: '0.85rem' },
        }}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: 60 }}>Ảnh</Table.Th>
            <Table.Th>Tên sản phẩm</Table.Th>
            <Table.Th style={{ width: 100 }}>Đơn vị</Table.Th>
            <Table.Th>Danh mục</Table.Th>
            <Table.Th>Tên khác</Table.Th>
            <Table.Th style={{ textAlign: 'right', width: 120 }}>Giá</Table.Th>
            <Table.Th style={{ textAlign: 'center', width: 110 }}>
              Thao tác
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {products.map((p) => {
            const catNames = p.product_categories
              .map((pc) => catMap.get(pc.category_id))
              .filter(Boolean)
              .join(', ')
            return (
              <Table.Tr key={p.id}>
                <Table.Td>
                  <div className="table-thumb">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} loading="lazy" />
                    ) : (
                      <IconPhoto size={18} color="#c4c4c4" />
                    )}
                  </div>
                </Table.Td>
                <Table.Td>
                  <strong>{p.name}</strong>
                </Table.Td>
                <Table.Td>{p.unit?.name ?? '—'}</Table.Td>
                <Table.Td>{catNames || '—'}</Table.Td>
                <Table.Td>
                  {p.product_aliases.length > 0 ? (
                    <div className="table-aliases">
                      {p.product_aliases.slice(0, 3).map((a) => (
                        <span key={a.id} className="alias-tag">
                          {a.alias}
                        </span>
                      ))}
                      {p.product_aliases.length > 3 && (
                        <span className="alias-more">
                          +{p.product_aliases.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    '—'
                  )}
                </Table.Td>
                <Table.Td
                  style={{
                    textAlign: 'right',
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {formatPrice(p.price)}
                </Table.Td>
                <Table.Td>
                  <Group gap={6} justify="center" wrap="nowrap">
                    <Tooltip label="Sửa" withArrow>
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => onEdit(p)}
                        aria-label="Sửa"
                      >
                        <IconPencil size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Xoá" withArrow>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => onDelete(p)}
                        aria-label="Xoá"
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            )
          })}
        </Table.Tbody>
      </Table>
    </div>
  )
}
