import { useState, useEffect } from 'react'
import { Drawer, TextInput, Button, Group, Text } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconChevronRight, IconCheck } from '@tabler/icons-react'

interface CategoryFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { name: string; parent_id: string | null }) => Promise<void>
  categoryOptions?: SelectOption[]
  initialValues?: { name: string; parent_id: string | null; id: string }
}

// ── Root-only Picker ──────────────────────────────────────────────────────────

interface RootPickerProps {
  options: SelectOption[]
  value: string
  onChange: (val: string) => void
  excludeId?: string
}

function RootPicker({ options, value, onChange, excludeId }: RootPickerProps) {
  const [open, setOpen] = useState(false)

  const filtered = options.filter((o) => o.value !== excludeId)
  const selected = filtered.find((o) => o.value === value)

  return (
    <div className="tree-picker">
      <button
        type="button"
        className={`tree-picker__trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="tree-picker__label">
          {selected ? selected.label : '— Cấp 1 (root) —'}
        </span>
        <IconChevronRight
          size={14}
          className={`tree-picker__arrow ${open ? 'rotated' : ''}`}
        />
      </button>

      {open && (
        <div className="tree-picker__dropdown">
          {/* Tuỳ chọn root */}
          <button
            type="button"
            className={`tree-picker__item tree-picker__item--root ${value === '' ? 'selected' : ''}`}
            onClick={() => {
              onChange('')
              setOpen(false)
            }}
          >
            <span>— Cấp 1 (root) —</span>
            {value === '' && (
              <IconCheck size={12} className="tree-picker__check" />
            )}
          </button>

          {filtered.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`tree-picker__item ${value === opt.value ? 'selected' : ''}`}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
            >
              <span>{opt.label}</span>
              {value === opt.value && (
                <IconCheck size={12} className="tree-picker__check" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── CategoryForm ──────────────────────────────────────────────────────────────

export default function CategoryForm({
  open,
  onClose,
  onSubmit,
  categoryOptions = [],
  initialValues,
}: CategoryFormProps) {
  const [saving, setSaving] = useState(false)
  const isEdit = !!initialValues

  const form = useForm({
    initialValues: {
      name: '',
      parent_id: '' as string,
    },
    validate: {
      name: (value) =>
        value.trim().length === 0 ? 'Tên danh mục là bắt buộc' : null,
    },
  })

  useEffect(() => {
    if (open) {
      form.setValues({
        name: initialValues?.name ?? '',
        parent_id: initialValues?.parent_id ?? '',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValues])

  function handleClose(): void {
    form.reset()
    onClose()
  }

  async function handleSubmit(values: typeof form.values): Promise<void> {
    setSaving(true)
    try {
      await onSubmit({
        name: values.name.trim(),
        parent_id: values.parent_id || null,
      })
      handleClose()
    } finally {
      setSaving(false)
    }
  }

  const isRootEdit = isEdit && initialValues?.parent_id === null

  return (
    <Drawer
      opened={open}
      onClose={handleClose}
      position="bottom"
      size="60%"
      title={
        <Text fw={800} fz="md" ff="var(--font)">
          {isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}
        </Text>
      }
      styles={{
        content: { borderRadius: '22px 22px 0 0' },
        header: { borderBottom: '1px solid var(--border)', paddingBottom: 12 },
        body: { padding: '16px 16px 0' },
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Tên danh mục"
          placeholder="VD: Đồ uống, Sữa…"
          required
          autoFocus
          mb="md"
          {...form.getInputProps('name')}
        />

        {!isRootEdit && (
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label>Danh mục cha (tuỳ chọn)</label>
            <RootPicker
              options={categoryOptions}
              value={form.values.parent_id}
              onChange={(val) => form.setFieldValue('parent_id', val)}
              excludeId={initialValues?.id}
            />
          </div>
        )}

        <Group gap={8} pb="md">
          <Button
            variant="default"
            onClick={handleClose}
            flex={1}
            styles={{ root: { fontFamily: 'var(--font)', fontWeight: 700 } }}
          >
            Huỷ
          </Button>
          <Button
            type="submit"
            loading={saving}
            flex={1}
            styles={{ root: { fontFamily: 'var(--font)', fontWeight: 800 } }}
            color="var(--em-600)"
          >
            {isEdit ? 'Cập nhật' : 'Lưu danh mục'}
          </Button>
        </Group>
      </form>
    </Drawer>
  )
}
