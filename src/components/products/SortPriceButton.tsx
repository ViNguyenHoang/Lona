import {
  IconArrowsSort,
  IconSortAscending2,
  IconSortDescending2,
} from '@tabler/icons-react'
import type { SortOrder } from '../../lib/productFilters'

interface Props {
  value: SortOrder
  onChange: (next: SortOrder) => void
}

const NEXT: Record<SortOrder, SortOrder> = {
  none: 'price-asc',
  'price-asc': 'price-desc',
  'price-desc': 'none',
}

export function SortPriceButton({ value, onChange }: Props) {
  const Icon =
    value === 'price-asc'
      ? IconSortAscending2
      : value === 'price-desc'
      ? IconSortDescending2
      : IconArrowsSort

  const label =
    value === 'price-asc'
      ? 'Giá: Thấp → Cao'
      : value === 'price-desc'
      ? 'Giá: Cao → Thấp'
      : 'Sắp xếp giá'

  const active = value !== 'none'

  return (
    <button
      type="button"
      className={`sort-pill${active ? ' sort-pill--active' : ''}`}
      onClick={() => onChange(NEXT[value])}
      aria-label="Sắp xếp theo giá"
    >
      <Icon size={15} />
      <span>{label}</span>
    </button>
  )
}
