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
  updated_at: string
  units: Unit | null
  product_categories: { category_id: string }[]
  product_aliases: { id: string; alias: string }[]
}

function normalise(row: ProductRow): Product {
  return {
    ...row,
    unit: row.units ?? null,
    product_aliases: row.product_aliases.map((a) => ({
      ...a,
      product_id: row.id,
    })),
  }
}

const PRODUCT_SELECT = `
  id, name, unit_id, price, image_url, image_public_id, created_at, updated_at,
  units ( id, name, created_at, updated_at ),
  product_categories ( category_id ),
  product_aliases ( id, alias )
`

interface UseProductsOptions {
  /** Chỉ lấy sản phẩm có price > value. Bỏ qua nếu không truyền. */
  priceGreaterThan?: number
}

// ─────────────────────────────────────────────────────────────────────────────

export function useProducts(options: UseProductsOptions = {}) {
  const { priceGreaterThan } = options
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceGreaterThan])

  async function fetchProducts(): Promise<void> {
    try {
      setLoading(true)
      let query = supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .order('updated_at', { ascending: false })

      if (priceGreaterThan !== undefined) {
        query = query.gt('price', priceGreaterThan)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setProducts((data as unknown as ProductRow[]).map(normalise))
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
    return normalise(fresh as unknown as ProductRow)
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

  async function bulkAddProducts(
    rows: {
      name: string
      unit_id: string | null
      price: number
      image_url: string | null
      image_public_id: string | null
      categoryIds: string[]
      aliases: string[]
    }[],
  ): Promise<{ inserted: number }> {
    if (rows.length === 0) return { inserted: 0 }

    const { data, error: pErr } = await supabase
      .from('products')
      .insert(
        rows.map((r) => ({
          name: r.name,
          unit_id: r.unit_id,
          price: r.price,
          image_url: r.image_url,
          image_public_id: r.image_public_id,
        })),
      )
      .select('id')
    if (pErr) throw pErr

    const ids = (data as { id: string }[]).map((d) => d.id)

    const categoryRows = rows.flatMap((r, i) =>
      r.categoryIds.map((cid) => ({
        product_id: ids[i],
        category_id: cid,
      })),
    )
    if (categoryRows.length > 0) {
      const { error: cErr } = await supabase
        .from('product_categories')
        .insert(categoryRows)
      if (cErr) throw cErr
    }

    const aliasRows = rows.flatMap((r, i) =>
      r.aliases.map((a) => ({ product_id: ids[i], alias: a })),
    )
    if (aliasRows.length > 0) {
      const { error: aErr } = await supabase
        .from('product_aliases')
        .insert(aliasRows)
      if (aErr) throw aErr
    }

    await fetchProducts()
    return { inserted: ids.length }
  }

  async function deleteAllProducts(): Promise<{ deleted: number }> {
    const { error: dErr } = await supabase
      .from('products')
      .delete()
      .not('id', 'is', null)
    if (dErr) throw dErr

    const count = products.length
    setProducts([])
    return { deleted: count }
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
    deleteAllProducts,
    bulkAddProducts,
    refetch: fetchProducts,
  }
}
