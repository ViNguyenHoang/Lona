import { useRef, useState } from 'react'
import {
  Menu,
  Modal,
  Button,
  Group,
  Text,
  Stack,
  Checkbox,
  ScrollArea,
  Badge,
  Alert,
} from '@mantine/core'
import {
  IconDotsVertical,
  IconDownload,
  IconUpload,
  IconAlertTriangle,
  IconFileSpreadsheet,
} from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import {
  productsToCsv,
  parseProductsCsv,
  PRODUCT_CSV_FIELDS,
  PRODUCT_CSV_FIELD_LABELS,
  type ProductCsvField,
  type ParsedProductRow,
} from '../../lib/productCsv'

interface Props {
  products: Product[]
  onBulkAdd: (
    rows: {
      name: string
      unit_id: string | null
      price: number
      image_url: string | null
      image_public_id: string | null
      categoryIds: string[]
      aliases: string[]
    }[],
  ) => Promise<{ inserted: number }>
  onDeleteAll: () => Promise<{ deleted: number }>
}

interface PreviewState {
  rows: ParsedProductRow[]
  errors: { line: number; message: string }[]
}

const DEFAULT_FIELDS: ProductCsvField[] = []

export default function ImportExportMenu({
  products,
  onBulkAdd,
  onDeleteAll,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const [exportOpen, setExportOpen] = useState(false)
  const [exportFields, setExportFields] =
    useState<ProductCsvField[]>(DEFAULT_FIELDS)

  const [importOpen, setImportOpen] = useState(false)
  const [importFields, setImportFields] =
    useState<ProductCsvField[]>(DEFAULT_FIELDS)

  const [preview, setPreview] = useState<PreviewState | null>(null)
  const [wipeBeforeImport, setWipeBeforeImport] = useState(true)
  const [isImporting, setImporting] = useState(false)

  // ── Export ──────────────────────────────────────────────────────────────────

  function openExportModal() {
    setExportFields(DEFAULT_FIELDS)
    setExportOpen(true)
  }

  function handleExport() {
    if (products.length === 0) {
      notifications.show({
        message: 'Không có sản phẩm để xuất',
        color: 'gray',
      })
      return
    }
    const csv = productsToCsv(products, exportFields)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const ts = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `san-pham-${ts}.csv`
    a.click()
    URL.revokeObjectURL(url)
    notifications.show({
      message: `Đã xuất ${products.length} sản phẩm`,
      color: 'teal',
    })
    setExportOpen(false)
  }

  // ── Import: pick file ───────────────────────────────────────────────────────

  function openImportModal() {
    setImportFields(DEFAULT_FIELDS)
    setImportOpen(true)
  }

  function pickFile() {
    fileRef.current?.click()
  }

  async function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    try {
      const text = await file.text()
      const { rows, errors } = parseProductsCsv(text, importFields)
      setWipeBeforeImport(true)
      setImportOpen(false)
      setPreview({ rows, errors })
    } catch (err) {
      notifications.show({
        message:
          'Không đọc được file: ' +
          (err instanceof Error ? err.message : 'Lỗi không xác định'),
        color: 'red',
      })
    }
  }

  // ── Import: confirm ─────────────────────────────────────────────────────────

  async function handleConfirmImport() {
    if (!preview) return
    setImporting(true)
    try {
      let deleted = 0
      if (wipeBeforeImport) {
        const res = await onDeleteAll()
        deleted = res.deleted
      }

      const payload = preview.rows.map((row) => ({
        name: row.name,
        unit_id: row.unit_id,
        price: row.price,
        image_url: row.image_url,
        image_public_id: row.image_public_id,
        categoryIds: row.categoryIds,
        aliases: [],
      }))

      const { inserted } = await onBulkAdd(payload)
      notifications.show({
        message: wipeBeforeImport
          ? `Đã xoá ${deleted} và nhập ${inserted} sản phẩm`
          : `Đã nhập ${inserted} sản phẩm`,
        color: 'teal',
      })
      setPreview(null)
    } catch (err) {
      notifications.show({
        message:
          'Lỗi nhập: ' +
          (err instanceof Error ? err.message : 'Không xác định'),
        color: 'red',
      })
    } finally {
      setImporting(false)
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function toggleField(
    field: ProductCsvField,
    list: ProductCsvField[],
    setter: (v: ProductCsvField[]) => void,
  ) {
    if (list.includes(field)) {
      setter(list.filter((f) => f !== field))
    } else {
      setter([...list, field])
    }
  }

  function renderFieldPicker(
    list: ProductCsvField[],
    setter: (v: ProductCsvField[]) => void,
  ) {
    return (
      <Stack gap={6}>
        <Checkbox
          label="name (bắt buộc)"
          checked
          disabled
          styles={{ label: { fontFamily: 'var(--font)' } }}
          color="teal"
        />
        <Checkbox
          label="price (bắt buộc)"
          checked
          disabled
          styles={{ label: { fontFamily: 'var(--font)' } }}
        />
        {PRODUCT_CSV_FIELDS.map((f) => (
          <Checkbox
            key={f}
            label={PRODUCT_CSV_FIELD_LABELS[f]}
            checked={list.includes(f)}
            onChange={() => toggleField(f, list, setter)}
            styles={{ label: { fontFamily: 'var(--font)' } }}
            color="teal"
          />
        ))}
      </Stack>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <Menu shadow="md" position="bottom-end" withinPortal>
        <Menu.Target>
          <button className="add-btn" aria-label="Thêm tuỳ chọn" type="button">
            <IconDotsVertical size={20} />
          </button>
        </Menu.Target>
        <Menu.Dropdown style={{ fontFamily: 'var(--font)', fontWeight: 600 }}>
          <Menu.Item
            leftSection={<IconUpload size={16} />}
            onClick={openImportModal}
            style={{ fontFamily: 'var(--font)' }}
          >
            Nhập CSV
          </Menu.Item>
          <Menu.Item
            leftSection={<IconDownload size={16} />}
            onClick={openExportModal}
            style={{ fontFamily: 'var(--font)' }}
          >
            Xuất CSV
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: 'none' }}
        onChange={onFileChosen}
      />

      {/* Export field picker */}
      <Modal
        opened={exportOpen}
        onClose={() => setExportOpen(false)}
        title={
          <Text fw={800} fz="md" ff="var(--font)">
            Xuất CSV — chọn trường
          </Text>
        }
        centered
        size="md"
        styles={{ content: { fontFamily: 'var(--font)', borderRadius: 16 } }}
      >
        <Stack gap="sm">
          <Text fz="xs" c="dimmed" ff="var(--font)">
            Chọn các trường tuỳ chọn để xuất. <b>name</b> và <b>price</b> luôn
            được xuất.
          </Text>
          {renderFieldPicker(exportFields, setExportFields)}
          <Group gap={8} mt="sm">
            <Button
              variant="default"
              flex={1}
              onClick={() => setExportOpen(false)}
              styles={{ root: { fontFamily: 'var(--font)', fontWeight: 700 } }}
            >
              Huỷ
            </Button>
            <Button
              color="teal"
              flex={1}
              leftSection={<IconDownload size={16} />}
              onClick={handleExport}
              styles={{ root: { fontFamily: 'var(--font)', fontWeight: 800 } }}
            >
              Xuất {products.length} SP
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Import field picker */}
      <Modal
        opened={importOpen}
        onClose={() => setImportOpen(false)}
        title={
          <Text fw={800} fz="md" ff="var(--font)">
            Nhập CSV — chọn trường
          </Text>
        }
        centered
        size="md"
        styles={{ content: { fontFamily: 'var(--font)', borderRadius: 16 } }}
      >
        <Stack gap="sm">
          <Text fz="xs" c="dimmed" ff="var(--font)">
            Chọn các trường tuỳ chọn cần nhập. File CSV phải có đủ các cột tương
            ứng. <b>name</b> và <b>price</b> luôn bắt buộc.
          </Text>
          {renderFieldPicker(importFields, setImportFields)}
          <Group gap={8} mt="sm">
            <Button
              variant="default"
              flex={1}
              onClick={() => setImportOpen(false)}
              styles={{ root: { fontFamily: 'var(--font)', fontWeight: 700 } }}
            >
              Huỷ
            </Button>
            <Button
              color="teal"
              flex={1}
              leftSection={<IconFileSpreadsheet size={16} />}
              onClick={pickFile}
              styles={{ root: { fontFamily: 'var(--font)', fontWeight: 800 } }}
            >
              Chọn file
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Import preview */}
      <Modal
        opened={preview !== null}
        onClose={() => !isImporting && setPreview(null)}
        title={
          <Text fw={800} fz="md" ff="var(--font)">
            Xem trước nhập CSV
          </Text>
        }
        centered
        size="lg"
        styles={{ content: { fontFamily: 'var(--font)', borderRadius: 16 } }}
      >
        {preview && (
          <Stack gap="sm">
            <Group gap="xs">
              <Badge color="teal" variant="light">
                {preview.rows.length} sản phẩm hợp lệ
              </Badge>
              {preview.errors.length > 0 && (
                <Badge color="red" variant="light">
                  {preview.errors.length} dòng lỗi
                </Badge>
              )}
            </Group>

            <Checkbox
              label={`Xoá toàn bộ ${products.length} sản phẩm hiện có trước khi nhập`}
              checked={wipeBeforeImport}
              onChange={(e) => setWipeBeforeImport(e.currentTarget.checked)}
              styles={{ label: { fontFamily: 'var(--font)' } }}
            />

            {wipeBeforeImport && (
              <Alert
                color="red"
                variant="light"
                icon={<IconAlertTriangle size={16} />}
                styles={{
                  message: { fontFamily: 'var(--font)', fontSize: 12 },
                }}
              >
                Toàn bộ sản phẩm sẽ bị xoá. Hành động này không thể hoàn tác.
              </Alert>
            )}

            {preview.errors.length > 0 && (
              <Stack gap={4}>
                <Group gap={4}>
                  <IconAlertTriangle size={14} color="#d97706" />
                  <Text fz="xs" fw={700} c="orange.7" ff="var(--font)">
                    Các dòng bị bỏ qua:
                  </Text>
                </Group>
                <ScrollArea.Autosize mah={120}>
                  <Stack gap={2}>
                    {preview.errors.map((e, i) => (
                      <Text key={i} fz="xs" c="dimmed" ff="var(--font)">
                        Dòng {e.line}: {e.message}
                      </Text>
                    ))}
                  </Stack>
                </ScrollArea.Autosize>
              </Stack>
            )}

            <Group gap={8} mt="sm">
              <Button
                variant="default"
                flex={1}
                onClick={() => setPreview(null)}
                disabled={isImporting}
                styles={{
                  root: { fontFamily: 'var(--font)', fontWeight: 700 },
                }}
              >
                Huỷ
              </Button>
              <Button
                color={wipeBeforeImport ? 'red' : 'teal'}
                flex={1}
                loading={isImporting}
                disabled={preview.rows.length === 0}
                onClick={handleConfirmImport}
                styles={{
                  root: { fontFamily: 'var(--font)', fontWeight: 800 },
                }}
              >
                {wipeBeforeImport
                  ? `Xoá hết & nhập ${preview.rows.length} SP`
                  : `Nhập ${preview.rows.length} SP`}
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  )
}
