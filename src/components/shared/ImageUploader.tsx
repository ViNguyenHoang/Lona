import { useRef } from 'react'
import { IconCamera, IconUpload, IconX } from '@tabler/icons-react'

interface ImageUploaderProps {
  existingUrl: string | null // ảnh đã lưu trong DB (khi edit)
  pendingFile: File | null // file mới user vừa chọn, chưa upload
  onFileSelect: (file: File | null) => void
}

export default function ImageUploader({
  existingUrl,
  pendingFile,
  onFileSelect,
}: ImageUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  // Preview: ưu tiên file mới (local blob), fallback về URL đã lưu
  const previewUrl = pendingFile
    ? URL.createObjectURL(pendingFile)
    : existingUrl

  function handleFile(file: File | undefined) {
    if (!file) return
    onFileSelect(file) // chỉ lưu vào state, KHÔNG upload
  }

  function handleRemove() {
    onFileSelect(null)
    // reset input để user có thể chọn lại cùng file
    if (fileRef.current) fileRef.current.value = ''
    if (cameraRef.current) cameraRef.current.value = ''
  }

  return (
    <div>
      {previewUrl ? (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={previewUrl}
              alt="preview"
              style={{
                width: 80,
                height: 80,
                objectFit: 'cover',
                borderRadius: 8,
              }}
            />
            <button
              type="button"
              onClick={handleRemove}
              style={{
                position: 'absolute',
                top: -6,
                right: -6,
                background: '#111',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 20,
                height: 20,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconX size={12} />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Chọn từ gallery */}
          <label className="img-uploader" style={{ flex: 1 }}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files?.[0])}
              style={{ display: 'none' }}
            />
            <IconUpload
              size={22}
              color="#9ca3af"
              style={{ margin: '0 auto 4px' }}
            />
            <p>Chọn ảnh</p>
          </label>

          {/* Chụp ảnh (mobile) */}
          <label className="img-uploader" style={{ flex: 1 }}>
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFile(e.target.files?.[0])}
              style={{ display: 'none' }}
            />
            <IconCamera
              size={22}
              color="#9ca3af"
              style={{ margin: '0 auto 4px' }}
            />
            <p>Chụp ảnh</p>
          </label>
        </div>
      )}
    </div>
  )
}
