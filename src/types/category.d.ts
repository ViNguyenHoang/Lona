interface Category {
  id: string
  name: string
  parent_id: string | null
  created_at: string
  updated_at: string
}

interface CategoryNode extends Category {
  children?: CategoryNode[]
}

/*
  |--------------------------------------------------------------------------
  | Form Params
  |--------------------------------------------------------------------------
*/

interface CategoryFormCreate {
  name: string
  parent_id?: string | null
}
