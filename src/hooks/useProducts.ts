import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { deleteImage } from '../lib/cloudinary'

interface ProductRow {
  id: string
  name: string
  unit_id: string | null
  price: number
  image_url: string | null
  image_public_id: string | null
  created_at: string
  units: { id: string; name: string }[] | null
  product_categories: { category_id: string }[]
  product_aliases: { id: string; alias: string }[]
}

function normalise(row: ProductRow): Product {
  return {
    ...row,
    units: row.units?.[0] ?? null,
    product_aliases: row.product_aliases.map((a) => ({
      ...a,
      product_id: row.id,
    })),
  }
}

const PRODUCT_SELECT = `
  id, name, unit_id, price, image_url, image_public_id, created_at,
  units ( id, name ),
  product_categories ( category_id ),
  product_aliases ( id, alias )
`

// ─────────────────────────────────────────────────────────────────────────────

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts(): Promise<void> {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .order('name')

      if (fetchError) throw fetchError
      setProducts((data as ProductRow[]).map(normalise))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setLoading(false)
    }
  }

  async function addProduct(payload: ProductFormCreate): Promise<Product> {
    const { data: product, error: pErr } = await supabase
      .from('products')
      .insert({
        name: payload.name,
        unit_id: payload.unit_id,
        price: payload.price,
        image_url: payload.image_url,
        image_public_id: payload.image_public_id,
      })
      .select()
      .single()
    if (pErr) throw pErr

    const newId = (product as { id: string }).id

    if (payload.categoryIds.length > 0) {
      const { error: cErr } = await supabase.from('product_categories').insert(
        payload.categoryIds.map((cid) => ({
          product_id: newId,
          category_id: cid,
        })),
      )
      if (cErr) throw cErr
    }

    if (payload.aliases.length > 0) {
      const { error: aErr } = await supabase
        .from('product_aliases')
        .insert(payload.aliases.map((a) => ({ product_id: newId, alias: a })))
      if (aErr) throw aErr
    }

    await fetchProducts()
    const { data: fresh } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('id', newId)
      .single()
    return normalise(fresh as ProductRow)
  }

  async function updateProduct(
    payload: ProductFormUpdate & {
      _old_image_public_id?: string | null
    },
  ): Promise<void> {
    if (payload._old_image_public_id) {
      try {
        await deleteImage(payload._old_image_public_id)
      } catch {
        console.warn('Không thể xóa ảnh cũ trên Cloudinary')
      }
    }

    const { error: pErr } = await supabase
      .from('products')
      .update({
        name: payload.name,
        unit_id: payload.unit_id,
        price: payload.price,
        image_url: payload.image_url,
        image_public_id: payload.image_public_id,
      })
      .eq('id', payload.id)
    if (pErr) throw pErr

    await supabase
      .from('product_categories')
      .delete()
      .eq('product_id', payload.id)
    if (payload.categoryIds.length > 0) {
      const { error: cErr } = await supabase.from('product_categories').insert(
        payload.categoryIds.map((cid) => ({
          product_id: payload.id,
          category_id: cid,
        })),
      )
      if (cErr) throw cErr
    }

    await supabase.from('product_aliases').delete().eq('product_id', payload.id)
    if (payload.aliases.length > 0) {
      const { error: aErr } = await supabase
        .from('product_aliases')
        .insert(
          payload.aliases.map((a) => ({ product_id: payload.id, alias: a })),
        )
      if (aErr) throw aErr
    }

    await fetchProducts()
  }

  async function deleteProduct(id: string): Promise<void> {
    const product = products.find((p) => p.id === id)

    const { error: dErr } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    if (dErr) throw dErr

    if (product?.image_public_id) {
      try {
        await deleteImage(product.image_public_id)
      } catch {
        console.warn(
          'Xóa sản phẩm thành công nhưng không thể xóa ảnh Cloudinary',
        )
      }
    }

    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  }
}
