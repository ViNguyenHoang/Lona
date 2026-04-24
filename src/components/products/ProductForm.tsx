import { useState, useEffect } from 'react'
import {
  Drawer,
  TextInput,
  NumberInput,
  Button,
  Group,
  Text,
  Badge,
  Stack,
  ActionIcon,
  Divider,
  ScrollArea,
  Collapse,
  Select,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import {
  IconChevronDown,
  IconChevronRight,
  IconCheck,
  IconX,
} from '@tabler/icons-react'
import ImageUploader from '../shared/ImageUploader'
import { uploadImage } from '../../lib/cloudinary'

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProductFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: ProductFormCreate | ProductFormUpdate) => Promise<void>
  product?: Product | null
  units: Unit[]
  categories: Category[]
}

// ─── Tree category selector ───────────────────────────────────────────────────

interface TreeNodeProps {
  category: Category
  allCategories: Category[]
  selected: string[]
  onToggle: (id: string) => void
  depth?: number
}

function TreeNode({
  category,
  allCategories,
  selected,
  onToggle,
  depth = 0,
}: TreeNodeProps) {
  const children = allCategories.filter((c) => c.parent_id === category.id)
  const hasChildren = children.length > 0
  const [open, setOpen] = useState(false)
  const isSelected = selected.includes(category.id)

  return (
    <div>
      <Group
        gap={6}
        py={6}
        px={8}
        wrap="nowrap"
        style={{
          borderRadius: 10,
          cursor: 'pointer',
          background: isSelected ? 'var(--clr-green-soft)' : 'transparent',
          transition: 'background 0.15s',
        }}
        onClick={() => onToggle(category.id)}
      >
        {hasChildren ? (
          <ActionIcon
            size="xs"
            variant="transparent"
            onClick={(e) => {
              e.stopPropagation()
              setOpen((o) => !o)
            }}
          >
            {open ? (
              <IconChevronDown size={13} />
            ) : (
              <IconChevronRight size={13} />
            )}
          </ActionIcon>
        ) : (
          <div style={{ width: 22, flexShrink: 0 }} />
        )}

        <Text
          fz="sm"
          fw={isSelected ? 700 : depth === 0 ? 600 : 500}
          c={depth === 0 ? 'var(--text)' : 'var(--text-2)'}
          style={{ flex: 1, fontFamily: 'var(--font)' }}
        >
          {depth > 0 && (
            <span style={{ color: 'var(--text-3)', marginRight: 4 }}>└</span>
          )}
          {category.name}
        </Text>

        {isSelected && <IconCheck size={14} color="var(--clr-green)" />}
      </Group>

      {hasChildren && (
        <Collapse expanded={open}>
          <div
            style={{
              paddingLeft: 20,
              borderLeft: '2px solid var(--border)',
              marginLeft: 18,
            }}
          >
            {children.map((child) => (
              <TreeNode
                key={child.id}
                category={child}
                allCategories={allCategories}
                selected={selected}
                onToggle={onToggle}
                depth={depth + 1}
              />
            ))}
          </div>
        </Collapse>
      )}
    </div>
  )
}

// ─── Input styles ─────────────────────────────────────────────────────────────

const IS = {
  label: {
    fontFamily: 'var(--font)',
    fontWeight: 700,
    color: 'var(--text-2)',
    fontSize: '0.8rem',
  },
  input: {
    fontFamily: 'var(--font)',
    borderColor: 'var(--border)',
    fontSize: '0.9rem',
  },
}

// ─── Form values ──────────────────────────────────────────────────────────────

interface ProductFormValues {
  name: string
  unit_id: string
  price: number | ''
  categoryIds: string[]
  aliases: string[]
}

// Gom 3 image state thành 1 object → chỉ 1 setImageState trong useEffect
interface ImageState {
  existingUrl: string | null
  existingPublicId: string | null
  pendingFile: File | null
  removed: boolean
}

const EMPTY_IMAGE: ImageState = {
  existingUrl: null,
  existingPublicId: null,
  pendingFile: null,
  removed: false,
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProductForm({
  open,
  onClose,
  onSubmit,
  product,
  units,
  categories,
}: ProductFormProps) {
  const isEdit = !!product
  const [saving, setSaving] = useState(false)
  const [aliasInput, setAliasInput] = useState('')
  const [imageState, setImageState] = useState<ImageState>(EMPTY_IMAGE)

  const form = useForm<ProductFormValues>({
    initialValues: {
      name: '',
      unit_id: '',
      price: '',
      categoryIds: [],
      aliases: [],
    },
    validate: {
      name: (value) =>
        value.trim().length === 0 ? 'Tên sản phẩm là bắt buộc' : null,
      price: (value) =>
        value === '' || value === undefined ? 'Giá là bắt buộc' : null,
    },
  })

  // ── Populate on open — chỉ 1 setState cho image ──────────────────────────
  useEffect(() => {
    if (!open) return

    if (product) {
      form.setValues({
        name: product.name,
        unit_id: product.unit_id ?? '',
        price: product.price,
        categoryIds: product.product_categories.map((pc) => pc.category_id),
        aliases: product.product_aliases.map((a) => a.alias),
      })
      setImageState({
        existingUrl: product.image_url,
        existingPublicId: product.image_public_id,
        pendingFile: null,
        removed: false,
      })
    } else {
      form.setValues({
        name: '',
        unit_id: '',
        price: '',
        categoryIds: [],
        aliases: [],
      })
      setImageState(EMPTY_IMAGE)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product])

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleClose() {
    form.reset()
    setAliasInput('')
    setImageState(EMPTY_IMAGE)
    onClose()
  }

  function handleFileSelect(file: File | null) {
    if (file === null) {
      // Bấm X — nếu đang có ảnh cũ thì đánh dấu removed
      setImageState((prev) => ({
        existingUrl: null,
        existingPublicId: prev.existingPublicId, // giữ để xóa cloudinary khi submit
        pendingFile: null,
        removed: !!prev.existingUrl || prev.removed,
      }))
    } else {
      // Chọn file mới
      setImageState((prev) => ({
        ...prev,
        pendingFile: file,
        removed: false,
      }))
    }
  }

  function toggleCategory(id: string) {
    form.setFieldValue(
      'categoryIds',
      form.values.categoryIds.includes(id)
        ? form.values.categoryIds.filter((x) => x !== id)
        : [...form.values.categoryIds, id],
    )
  }

  function addAlias() {
    const a = aliasInput.trim().toLowerCase()
    if (!a || form.values.aliases.includes(a)) {
      setAliasInput('')
      return
    }
    form.setFieldValue('aliases', [...form.values.aliases, a])
    setAliasInput('')
  }

  function removeAlias(alias: string) {
    form.setFieldValue(
      'aliases',
      form.values.aliases.filter((x) => x !== alias),
    )
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(values: ProductFormValues) {
    setSaving(true)
    try {
      let image_url: string | null = imageState.existingUrl
      let image_public_id: string | null = imageState.existingPublicId

      if (imageState.pendingFile) {
        // Upload ảnh mới
        const result = await uploadImage(imageState.pendingFile)
        image_url = result.url
        image_public_id = result.publicId
      } else if (imageState.removed) {
        // Xóa ảnh, không upload mới
        image_url = null
        image_public_id = null
      }

      // publicId ảnh cũ → useProducts sẽ xóa trên Cloudinary
      const oldPublicId =
        isEdit && (imageState.pendingFile || imageState.removed)
          ? (product?.image_public_id ?? null)
          : null

      const payload = {
        name: values.name.trim(),
        unit_id: values.unit_id || null,
        price: Number(values.price),
        image_url,
        image_public_id,
        categoryIds: values.categoryIds,
        aliases: values.aliases,
        _old_image_public_id: oldPublicId,
      }

      if (isEdit && product) {
        await onSubmit({ ...payload, id: product.id } as ProductFormUpdate)
      } else {
        await onSubmit(payload as ProductFormCreate)
      }

      handleClose()
    } finally {
      setSaving(false)
    }
  }

  const roots = categories.filter((c) => c.parent_id === null)

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Drawer
      opened={open}
      onClose={handleClose}
      position="bottom"
      size="95%"
      title={
        <Text fw={800} fz="md" ff="var(--font)">
          {isEdit ? `Sửa: ${product?.name}` : 'Thêm sản phẩm'}
        </Text>
      }
      styles={{
        content: {
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          flexDirection: 'column',
        },
        header: { borderBottom: '1px solid var(--border)', paddingBottom: 12 },
        body: {
          padding: 0,
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <form
        onSubmit={form.onSubmit(handleSubmit)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <ScrollArea style={{ flex: 1 }} px="md" py="sm">
          <Stack gap={20} pb={8}>
            {/* ── Name ── */}
            <TextInput
              label="Tên sản phẩm *"
              placeholder="VD: Milo, Coca Cola…"
              styles={IS}
              {...form.getInputProps('name')}
            />

            {/* ── Image ── */}
            <div>
              <Text fz="xs" fw={700} c="var(--text-2)" mb={8} ff="var(--font)">
                Ảnh sản phẩm
              </Text>
              <ImageUploader
                existingUrl={imageState.existingUrl}
                pendingFile={imageState.pendingFile}
                onFileSelect={handleFileSelect}
              />
            </div>

            <Divider />

            {/* ── Unit ── */}
            <Select
              label="Đơn vị tính"
              placeholder="Chọn đơn vị…"
              data={units.map((u) => ({ value: u.id, label: u.name }))}
              value={form.values.unit_id || null}
              onChange={(val) => form.setFieldValue('unit_id', val ?? '')}
              error={form.errors.unit_id}
              searchable
              nothingFoundMessage="Không tìm thấy"
              styles={{
                ...IS,
                option: { fontFamily: 'var(--font)', fontSize: '0.9rem' },
              }}
            />

            {/* ── Price ── */}
            <NumberInput
              label="Giá (đ) *"
              placeholder="0"
              min={0}
              thousandSeparator=","
              hideControls
              styles={IS}
              rightSection={
                <Text fz="xs" c="dimmed" pr={8} ff="var(--font)">
                  đ
                </Text>
              }
              {...form.getInputProps('price')}
            />

            <Divider />

            {/* ── Category tree ── */}
            {roots.length > 0 && (
              <div>
                <Text
                  fz="xs"
                  fw={700}
                  c="var(--text-2)"
                  mb={6}
                  ff="var(--font)"
                >
                  Danh mục
                  {form.values.categoryIds.length > 0 && (
                    <Badge ml={6} size="xs" variant="filled" color="green">
                      {form.values.categoryIds.length}
                    </Badge>
                  )}
                </Text>
                <div className="category-tree">
                  {roots.map((root) => (
                    <TreeNode
                      key={root.id}
                      category={root}
                      allCategories={categories}
                      selected={form.values.categoryIds}
                      onToggle={toggleCategory}
                      depth={0}
                    />
                  ))}
                </div>
              </div>
            )}

            <Divider />

            {/* ── Aliases ── */}
            <div>
              <Text fz="xs" fw={700} c="var(--text-2)" mb={8} ff="var(--font)">
                Alias giọng nói
              </Text>
              {form.values.aliases.length > 0 && (
                <Group gap={6} mb={10} wrap="wrap">
                  {form.values.aliases.map((a) => (
                    <Badge
                      key={a}
                      variant="light"
                      color="green"
                      rightSection={
                        <ActionIcon
                          size="xs"
                          variant="transparent"
                          color="green"
                          onClick={() => removeAlias(a)}
                        >
                          <IconX size={10} />
                        </ActionIcon>
                      }
                      style={{ fontFamily: 'var(--font)' }}
                    >
                      {a}
                    </Badge>
                  ))}
                </Group>
              )}
              <Group gap={8}>
                <TextInput
                  placeholder="mi lô, mê lô… (Enter để thêm)"
                  value={aliasInput}
                  onChange={(e) => setAliasInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addAlias()
                    }
                  }}
                  style={{ flex: 1 }}
                  styles={IS}
                />
                <Button
                  type="button"
                  variant="light"
                  color="green"
                  onClick={addAlias}
                  styles={{
                    root: { fontFamily: 'var(--font)', fontWeight: 700 },
                  }}
                >
                  Thêm
                </Button>
              </Group>
            </div>
          </Stack>
        </ScrollArea>

        {/* ── Footer ── */}
        <Group
          px="md"
          py="md"
          gap={8}
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <Button
            type="button"
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
            flex={2}
            color="var(--em-600)"
            styles={{ root: { fontFamily: 'var(--font)', fontWeight: 800 } }}
          >
            {isEdit ? 'Cập nhật' : 'Lưu sản phẩm'}
          </Button>
        </Group>
      </form>
    </Drawer>
  )
}
