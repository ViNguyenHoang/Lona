interface SearchProduct {
  id: string
  product_name: string
  price: number
  image_url: string | null
  unit_name: string | null
  aliases: string[]
  category_ids: string[]
}
