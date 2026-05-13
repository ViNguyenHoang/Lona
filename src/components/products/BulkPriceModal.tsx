import { useMemo, useState } from 'react'
import {
  Modal,
  Text,
  SegmentedControl,
  NumberInput,
  Group,
  Button,
  ScrollArea,
  ActionIcon,
  Select,
  Stack,
} from '@mantine/core'
import { IconX, IconArrowRight } from '@tabler/icons-react'
import { formatVnd } from '../../lib/productFilters'

type Action = 'increase' | 'decrease'
type Mode = 'percent' | 'amount'
type Round = 'none' | '500' | '1000'

interface Props {
  open: boolean
  onClose: () => void
  products: Product[]
  selectedIds: Set<string>
  onRemove: (id: string) => void
  onSubmit: (updates: { id: string; price: number }[]) => Promise<void>
}

function computeNewPrice(
  old: number,
  action: Action,
  mode: Mode,
  value: number,
  round: Round,
): number {
  if (!Number.isFinite(value) || value <= 0) return old

  let next: number
  if (mode === 'percent') {
    const factor = action === 'increase' ? 1 + value / 100 : 1 - value / 100
    next = old * factor
  } else {
    next = action === 'increase' ? old + value : old - value
  }

  if (next < 0) next = 0

  if (round === '500') {
    next = Math.round(next / 500) * 500
  } else if (round === '1000') {
    next = Math.round(next / 1000) * 1000
  } else {
    next = Math.round(next)
  }

  return next
}

export default function BulkPriceModal({
  open,
  onClose,
  products,
  selectedIds,
  onRemove,
  onSubmit,
}: Props) {
  const [action, setAction] = useState<Action>('increase')
  const [mode, setMode] = useState<Mode>('percent')
  const [value, setValue] = useState<number | string>(10)
  const [round, setRound] = useState<Round>('none')
  const [submitting, setSubmitting] = useState(false)

  const selected = useMemo(
    () => products.filter((p) => selectedIds.has(p.id)),
    [products, selectedIds],
  )

  const numericValue = typeof value === 'number' ? value : Number(value) || 0

  const previews = useMemo(
    () =>
      selected.map((p) => ({
        product: p,
        newPrice: computeNewPrice(p.price, action, mode, numericValue, round),
      })),
    [selected, action, mode, numericValue, round],
  )

  const changedCount = previews.filter(
    (x) => x.newPrice !== x.product.price,
  ).length

  async function handleApply() {
    const updates = previews
      .filter((x) => x.newPrice !== x.product.price)
      .map((x) => ({ id: x.product.id, price: x.newPrice }))
    if (updates.length === 0) return
    setSubmitting(true)
    try {
      await onSubmit(updates)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  const labelStyles = {
    label: { fontFamily: 'var(--font)', fontWeight: 700, marginBottom: 4 },
  }
  const segmentStyles = {
    root: { fontFamily: 'var(--font)' },
    label: { fontFamily: 'var(--font)', fontWeight: 700 },
  }

  return (
    <Modal
      opened={open}
      onClose={onClose}
      size="lg"
      title={
        <Text fw={800} fz="md" ff="var(--font)">
          Sửa giá hàng loạt
        </Text>
      }
      centered
      styles={{ content: { fontFamily: 'var(--font)', borderRadius: 16 } }}
    >
      <Stack gap={12}>
        <Group gap={8} grow>
          <SegmentedControl
            value={action}
            onChange={(v) => setAction(v as Action)}
            data={[
              { value: 'increase', label: 'Tăng' },
              { value: 'decrease', label: 'Giảm' },
            ]}
            styles={segmentStyles}
          />
          <SegmentedControl
            value={mode}
            onChange={(v) => setMode(v as Mode)}
            data={[
              { value: 'percent', label: 'Phần trăm (%)' },
              { value: 'amount', label: 'Số tiền (đ)' },
            ]}
            styles={segmentStyles}
          />
        </Group>

        <Group gap={8} align="end" grow>
          <NumberInput
            label={mode === 'percent' ? 'Giá trị (%)' : 'Giá trị (đ)'}
            value={value}
            onChange={setValue}
            min={0}
            step={mode === 'percent' ? 1 : 500}
            thousandSeparator={mode === 'amount' ? '.' : false}
            decimalSeparator=","
            hideControls={false}
            styles={{
              ...labelStyles,
              input: { fontFamily: 'var(--font)' },
            }}
          />
          <Select
            label="Làm tròn"
            value={round}
            onChange={(v) => setRound((v ?? 'none') as Round)}
            data={[
              { value: 'none', label: 'Không làm tròn' },
              { value: '500', label: 'Tròn 500đ' },
              { value: '1000', label: 'Tròn 1.000đ' },
            ]}
            allowDeselect={false}
            styles={{
              ...labelStyles,
              input: { fontFamily: 'var(--font)' },
            }}
          />
        </Group>

        <div className="bulk-price__summary">
          <Text fz="sm" fw={700} ff="var(--font)">
            Đã chọn {selected.length} sản phẩm
          </Text>
          {changedCount > 0 && changedCount !== selected.length && (
            <Text fz="xs" c="var(--text-3)" ff="var(--font)">
              · {changedCount} sẽ thay đổi
            </Text>
          )}
        </div>

        <ScrollArea.Autosize mah={300} type="auto">
          <div className="bulk-price__list">
            {previews.length === 0 ? (
              <Text fz="sm" c="var(--text-3)" ff="var(--font)" ta="center" py={20}>
                Chưa có sản phẩm nào được chọn
              </Text>
            ) : (
              previews.map(({ product, newPrice }) => {
                const changed = newPrice !== product.price
                return (
                  <div key={product.id} className="bulk-price__item">
                    <div className="bulk-price__name">{product.name}</div>
                    <div className="bulk-price__prices">
                      <span className="bulk-price__old">
                        {formatVnd(product.price)}
                      </span>
                      <IconArrowRight size={12} className="bulk-price__arrow" />
                      <span
                        className={
                          'bulk-price__new' +
                          (changed ? ' bulk-price__new--changed' : '')
                        }
                      >
                        {formatVnd(newPrice)}
                      </span>
                    </div>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="sm"
                      onClick={() => onRemove(product.id)}
                      aria-label="Bỏ chọn"
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea.Autosize>

        <Group gap={8} mt={4}>
          <Button
            variant="default"
            flex={1}
            onClick={onClose}
            styles={{ root: { fontFamily: 'var(--font)', fontWeight: 700 } }}
          >
            Huỷ
          </Button>
          <Button
            color="teal"
            flex={1}
            loading={submitting}
            disabled={changedCount === 0}
            onClick={handleApply}
            styles={{ root: { fontFamily: 'var(--font)', fontWeight: 800 } }}
          >
            Áp dụng ({changedCount})
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
