import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface CategoryNode extends Category {
  children: CategoryNode[]
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data as Category[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setLoading(false)
    }
  }

  async function addCategory({
    name,
    parent_id = null,
  }: CategoryFormCreate): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, parent_id })
      .select()
      .single()

    if (error) throw error
    const newCategory = data as Category
    setCategories((prev) => [...prev, newCategory])
    return newCategory
  }

  async function updateCategory(
    id: string,
    { name, parent_id = null }: CategoryFormCreate,
  ): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update({ name, parent_id })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    const updated = data as Category
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)))
    return updated
  }

  async function deleteCategory(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id)

    if (error) throw error

    // DB ON DELETE CASCADE đã xoá con → filter cả parent lẫn con khỏi local state
    setCategories((prev) =>
      prev.filter((c) => c.id !== id && c.parent_id !== id),
    )
  }

  function buildTree(flat: Category[]): CategoryNode[] {
    const map: Record<string, CategoryNode> = {}
    const roots: CategoryNode[] = []

    // Level 1: root
    flat
      .filter((c) => c.parent_id === null)
      .forEach((c) => {
        map[c.id] = { ...c, children: [] }
        roots.push(map[c.id])
      })

    // Level 2: children trực tiếp của root
    flat
      .filter((c) => c.parent_id !== null)
      .forEach((c) => {
        if (c.parent_id && map[c.parent_id]) {
          map[c.parent_id].children.push({ ...c, children: [] })
        }
      })

    return roots
  }

  // Chỉ root (parent_id = null) mới được chọn làm cha
  function buildSelectOptions(flat: Category[]): SelectOption[] {
    return flat
      .filter((c) => c.parent_id === null)
      .map((c) => ({ value: c.id, label: c.name }))
      .sort((a, b) => a.label.localeCompare(b.label, 'vi'))
  }

  return {
    categories,
    tree: buildTree(categories),
    selectOptions: buildSelectOptions(categories),
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
  }
}
