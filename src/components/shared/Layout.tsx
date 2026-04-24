import { Link, useLocation } from 'react-router-dom'
import { IconMicrophone, IconBuildingStore } from '@tabler/icons-react'

const navItems: NavItem[] = [
  { to: '/', label: 'Giọng nói', Icon: IconMicrophone },
  { to: '/products', label: 'Sản phẩm', Icon: IconBuildingStore },
]

export default function Layout({
  children,
  title,
  subtitle,
  icon: Icon,
}: LayoutProps) {
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
