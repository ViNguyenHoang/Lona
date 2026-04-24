interface Category {
  id: string
  name: string
  parent_id: string | null
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
