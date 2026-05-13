import { Link, useLocation } from 'react-router-dom'
import {
  IconMicrophone,
  IconBuildingStore,
  IconSettings,
} from '@tabler/icons-react'
import Logo from './Logo'

const navItems: NavItem[] = [
  { to: '/', label: 'Giọng nói', Icon: IconMicrophone },
  { to: '/products', label: 'Sản phẩm', Icon: IconBuildingStore },
  { to: '/admin/products', label: 'Quản lý', Icon: IconSettings },
]

export default function Layout({ children, title, subtitle }: LayoutProps) {
  const { pathname } = useLocation()

  return (
    <>
      <header className="site-header">
        <Logo size={32} className="site-header__logo" />
        <div>
          <div className="site-header__title">{title}</div>
          {subtitle && <div className="site-header__sub">{subtitle}</div>}
        </div>
      </header>

      <main>{children}</main>

      <nav className="bottom-nav">
        {navItems.map(({ to, label, Icon: NavIcon }) => (
          <Link
            key={to}
            to={to}
            className={`bottom-nav__item ${pathname === to ? 'active' : ''}`}
          >
            <NavIcon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
