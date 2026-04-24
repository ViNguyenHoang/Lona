import { Link, useLocation } from 'react-router-dom'
import { IconCategory2, IconPackage, IconRuler } from '@tabler/icons-react'

const navItems: NavItem[] = [
  { to: '/admin/products', label: 'Sản phẩm', Icon: IconPackage },
  { to: '/admin/categories', label: 'Danh Mục', Icon: IconCategory2 },
  { to: '/admin/units', label: 'Đơn vị', Icon: IconRuler },
]

export default function LayoutAdmin({
  children,
  title,
  subtitle,
  icon: Icon,
}: LayoutAdminProps) {
  const { pathname } = useLocation()

  return (
    <>
      <header className="site-header">
        {Icon && <Icon size={22} className="site-header__logo" />}
        <div>
          <div className="site-header__title">{title}</div>
          {subtitle && <div className="site-header__sub">{subtitle}</div>}
        </div>
      </header>

      <div className="manage-page">{children}</div>

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
