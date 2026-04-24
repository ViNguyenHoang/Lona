import { IconPhoto, IconTrash, IconPencil } from '@tabler/icons-react'
import type { SearchProduct } from '../../hooks/useSearch'

interface AdminCardProps {
  product: Product
  mode: 'admin'
  onDelete?: (product: Product) => void
  onEdit?: (product: Product) => void
}

interface BrowseCardProps {
  product: Product | SearchProduct
  mode?: 'browse'
  onDelete?: never
  onEdit?: never
}

type ProductCardProps = AdminCardProps | BrowseCardProps

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
}

// ── Type guards ───────────────────────────────────────────────────────────────

function isFullProduct(p: Product | SearchProduct): p is Product {
  return 'product_aliases' in p
}

// ── Normalise sang shape hiển thị ────────────────────────────────────────────

interface DisplayData {
  id: string
  name: string
  unitName: string | null
  price: number
  imageUrl: string | null
  aliases: { id: string; alias: string }[]
}

function toDisplay(p: Product | SearchProduct): DisplayData {
  if (isFullProduct(p)) {
    return {
      id: p.id,
      name: p.name,
      unitName: p.units?.name ?? null,
      price: p.price,
      imageUrl: p.image_url,
      aliases: p.product_aliases,
    }
  }
  // SearchProduct
  return {
    id: p.id,
    name: p.product_name,
    unitName: p.unit_name,
    price: p.price,
    imageUrl: p.image_url,
    aliases: [], // search result không cần hiện alias
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ProductCard({
  product,
  mode = 'browse',
  onDelete,
  onEdit,
}: ProductCardProps) {
  const d = toDisplay(product)

  return (
    <div className="product-card">
      <div className="card__img">
        {d.imageUrl ? (
          <img src={d.imageUrl} alt={d.name} loading="lazy" />
        ) : (
          <div className="card__no-img">
            <IconPhoto size={28} color="#c4c4c4" />
          </div>
        )}
      </div>

      <div className="card__body">
        <div className="card__name">{d.name}</div>

        {d.unitName && <div className="card__unit">{d.unitName}</div>}

        <div className="card__price">{formatPrice(d.price)}</div>

        {d.aliases.length > 0 && (
          <div className="card__aliases">
            {d.aliases.slice(0, 3).map((a) => (
              <span key={a.id} className="alias-tag">
                {a.alias}
              </span>
            ))}
          </div>
        )}

        {mode === 'admin' && (
          <div className="card__actions">
            {onEdit && (
              <button
                className="btn--edit"
                onClick={() => onEdit(product as Product)}
              >
                <IconPencil size={13} />
                Sửa
              </button>
            )}
            {onDelete && (
              <button
                className="btn--delete"
                onClick={() => onDelete(product as Product)}
              >
                <IconTrash size={13} />
                Xoá
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
