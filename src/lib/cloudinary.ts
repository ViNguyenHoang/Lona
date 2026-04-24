const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string
const UPLOAD_FOLDER = import.meta.env.VITE_CLOUDINARY_UPLOAD_FOLDER as string
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY as string
const API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET as string

export interface UploadResult {
  url: string
  publicId: string
}

export async function uploadImage(file: File): Promise<UploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', UPLOAD_FOLDER)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData },
  )

  if (!res.ok) throw new Error('Upload ảnh thất bại')

  const data: { secure_url: string; public_id: string } = await res.json()
  return { url: data.secure_url, publicId: data.public_id }
}

export async function deleteImage(publicId: string): Promise<void> {
  const timestamp = Math.floor(Date.now() / 1000).toString()

  // Tạo signature bằng SHA-1
  const str = `public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`
  const msgBuffer = new TextEncoder().encode(str)
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer)
  const signature = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  const form = new FormData()
  form.append('public_id', publicId)
  form.append('api_key', API_KEY)
  form.append('timestamp', timestamp)
  form.append('signature', signature)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
    { method: 'POST', body: form },
  )

  const data = await res.json()
  if (data.result !== 'ok') {
    throw new Error('Xóa ảnh thất bại: ' + data.result)
  }
}
