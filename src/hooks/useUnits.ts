import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useUnits() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUnits()
  }, [])

  async function fetchUnits() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('name')

      if (error) throw error
      setUnits(data as Unit[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setLoading(false)
    }
  }

  async function addUnit({ name }: UnitFormCreate): Promise<Unit> {
    const { data, error } = await supabase
      .from('units')
      .insert({ name })
      .select()
      .single()

    if (error) throw error
    const newUnit = data as Unit
    setUnits((prev) => [...prev, newUnit].sort((a, b) => a.name.localeCompare(b.name, 'vi')))
    return newUnit
  }

  async function updateUnit(id: string, { name }: UnitFormCreate): Promise<Unit> {
    const { data, error } = await supabase
      .from('units')
      .update({ name })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    const updated = data as Unit
    setUnits((prev) =>
      prev.map((u) => (u.id === id ? updated : u)).sort((a, b) => a.name.localeCompare(b.name, 'vi')),
    )
    return updated
  }

  async function deleteUnit(id: string): Promise<void> {
    const { error } = await supabase.from('units').delete().eq('id', id)
    if (error) throw error
    setUnits((prev) => prev.filter((u) => u.id !== id))
  }

  return {
    units,
    loading,
    error,
    addUnit,
    updateUnit,
    deleteUnit,
    refetch: fetchUnits,
  }
}
