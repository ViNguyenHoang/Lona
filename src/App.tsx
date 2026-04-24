import { Routes, Route } from 'react-router-dom'
import SearchPage from './pages/SearchPage'
import ProductPage from './pages/ProductsPage'
import AdminProductsPage from './pages/AdminProductsPage'
import AdminCategoriesPage from './pages/AdminCategoriesPage'
import AdminUnitsPage from './pages/AdminUnitsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SearchPage />} />
      <Route path="/products" element={<ProductPage />} />
      <Route path="/admin/products" element={<AdminProductsPage />} />
      <Route path="/admin/categories" element={<AdminCategoriesPage />} />
      <Route path="/admin/units" element={<AdminUnitsPage />} />
    </Routes>
  )
}
