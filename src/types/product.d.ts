interface Product {
  id: string
  name: string
  unit_id: string | null
  price: number
  image_url: string | null
  image_public_id: string | null
  created_at: string
  units: Unit | null
  product_categories: { category_id: string }[]
  product_aliases: ProductAlias[]
}

interface ProductAlias {
  id: string
  product_id: string
  alias: string
}

interface ProductCategory {
  product_id: string
  category_id: string
}

/*
  |--------------------------------------------------------------------------
  | Form Params
  |--------------------------------------------------------------------------
*/

interface ProductFormCreate {
  name: string
  unit_id: string | null
  price: number
  image_url: string | null
  image_public_id: string | null
  categoryIds: string[]
  aliases: string[]
}

interface ProductFormUpdate extends ProductFormCreate {
  id: string
}
