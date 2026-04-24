import { useState, useEffect } from 'react'
import { Drawer, TextInput, Button, Group, Text } from '@mantine/core'
import { useForm } from '@mantine/form'

interface UnitFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: UnitFormCreate) => Promise<void>
  initialValues?: { name: string; id: string }
}

export default function UnitForm({
  open,
  onClose,
  onSubmit,
  initialValues,
}: UnitFormProps) {
  const [saving, setSaving] = useState(false)
  const isEdit = !!initialValues

  const form = useForm({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) =>
        value.trim().length === 0 ? 'Tên đơn vị là bắt buộc' : null,
    },
  })

  useEffect(() => {
    if (open) {
      form.setValues({
        name: initialValues?.name ?? '',
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
      await onSubmit({ name: values.name.trim() })
      handleClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer
      opened={open}
      onClose={handleClose}
      position="bottom"
      size="30%"
      title={
        <Text fw={800} fz="md" ff="var(--font)">
          {isEdit ? 'Chỉnh sửa đơn vị' : 'Thêm đơn vị'}
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
          label="Tên đơn vị"
          placeholder="VD: hộp, lốc, thùng, chai…"
          required
          autoFocus
          mb="md"
          {...form.getInputProps('name')}
        />

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
            {isEdit ? 'Cập nhật' : 'Lưu đơn vị'}
          </Button>
        </Group>
      </form>
    </Drawer>
  )
}
