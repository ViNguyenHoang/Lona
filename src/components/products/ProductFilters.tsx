import {
  Collapse,
  RangeSlider,
  Select,
  Stack,
  Group,
  Button,
  Text,
  NumberInput,
} from '@mantine/core'
import { IconAdjustmentsHorizontal, IconX } from '@tabler/icons-react'
import {
  DEFAULT_FILTERS,
  PRICE_MAX,
  PRICE_MIN,
  PRICE_STEP,
  activeFilterCount,
  isDefaultFilters,
  type ProductFilterState,
} from '../../lib/productFilters'

interface FilterButtonProps {
  filters: ProductFilterState
  open: boolean
  onToggle: () => void
}

export function ProductFilterButton({
  filters,
  open,
  onToggle,
}: FilterButtonProps) {
  const count = activeFilterCount(filters)
  return (
    <button
      type="button"
      className={`filter-pill${open ? ' filter-pill--open' : ''}${
        count > 0 ? ' filter-pill--active' : ''
      }`}
      onClick={onToggle}
      aria-label="Lọc sản phẩm"
      aria-expanded={open}
    >
      <IconAdjustmentsHorizontal size={15} />
      <span>Lọc</span>
      {count > 0 && <span className="filter-pill__badge">{count}</span>}
    </button>
  )
}

interface PanelProps {
  open: boolean
  filters: ProductFilterState
  onChange: (next: ProductFilterState) => void
  units: Unit[]
}

export function ProductFilterPanel({
  open,
  filters,
  onChange,
  units,
}: PanelProps) {
  const unitOptions = [...units]
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
    .map((u) => ({ value: u.id, label: u.name }))

  const [minPrice, maxPrice] = filters.priceRange

  function setRange(next: [number, number]) {
    let [lo, hi] = next
    lo = Math.max(PRICE_MIN, Math.min(lo, PRICE_MAX))
    hi = Math.max(PRICE_MIN, Math.min(hi, PRICE_MAX))
    if (lo > hi) lo = hi
    onChange({ ...filters, priceRange: [lo, hi] })
  }

  function setMin(v: string | number) {
    const n = typeof v === 'number' ? v : Number(v)
    setRange([Number.isFinite(n) ? n : PRICE_MIN, maxPrice])
  }

  function setMax(v: string | number) {
    const n = typeof v === 'number' ? v : Number(v)
    setRange([minPrice, Number.isFinite(n) ? n : PRICE_MAX])
  }

  return (
    <Collapse expanded={open}>
      <div className="filter-panel">
        <Stack gap={14}>
          <Select
            label="Đơn vị"
            placeholder="Tất cả đơn vị"
            data={unitOptions}
            value={filters.unitId}
            onChange={(v) => onChange({ ...filters, unitId: v })}
            searchable
            clearable
            nothingFoundMessage="Không có đơn vị"
            styles={{
              label: { fontFamily: 'var(--font)', fontWeight: 700 },
              input: {
                fontFamily: 'var(--font)',
                borderColor: 'var(--border)',
              },
              option: { fontFamily: 'var(--font)' },
            }}
          />

          <div>
            <Text fz="sm" fw={700} ff="var(--font)" mb={6}>
              Khoảng giá (đ)
            </Text>
            <Group gap={8} grow mb={10}>
              <NumberInput
                value={minPrice}
                onChange={setMin}
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                thousandSeparator="."
                decimalSeparator=","
                placeholder="Từ"
                hideControls
                styles={{
                  input: {
                    fontFamily: 'var(--font)',
                    borderColor: 'var(--border)',
                  },
                }}
              />
              <NumberInput
                value={maxPrice}
                onChange={setMax}
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                thousandSeparator="."
                decimalSeparator=","
                placeholder="Đến"
                hideControls
                styles={{
                  input: {
                    fontFamily: 'var(--font)',
                    borderColor: 'var(--border)',
                  },
                }}
              />
            </Group>
            <RangeSlider
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              minRange={PRICE_STEP}
              value={filters.priceRange}
              onChange={setRange}
              label={null}
              color="teal"
              marks={[
                { value: 0, label: '0' },
                { value: 500_000, label: '500K' },
                { value: 1_000_000, label: '1Tr' },
                { value: 2_000_000, label: '2Tr' },
              ]}
              styles={{
                markLabel: {
                  fontFamily: 'var(--font)',
                  fontSize: 10,
                  color: 'var(--text-3)',
                },
              }}
            />
          </div>

          <Group justify="flex-end" mt={4}>
            <Button
              variant="subtle"
              size="xs"
              color="gray"
              leftSection={<IconX size={14} />}
              onClick={() => onChange(DEFAULT_FILTERS)}
              disabled={isDefaultFilters(filters)}
              styles={{ root: { fontFamily: 'var(--font)', fontWeight: 700 } }}
            >
              Đặt lại
            </Button>
          </Group>
        </Stack>
      </div>
    </Collapse>
  )
}
