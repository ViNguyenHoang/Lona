import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  IconBuildingStore,
  IconCategory2,
  IconLogout,
  IconPackage,
  IconRuler,
} from '@tabler/icons-react'
import { ActionIcon, Text } from '@mantine/core'
import { useAuth } from '../../contexts/AuthContext'
import Logo from './Logo'

const navItems: NavItem[] = [
  { to: '/admin/products', label: 'Sản phẩm', Icon: IconPackage },
  { to: '/admin/categories', label: 'Danh Mục', Icon: IconCategory2 },
  { to: '/admin/units', label: 'Đơn vị', Icon: IconRuler },
  { to: '/', label: 'Cửa hàng', Icon: IconBuildingStore },
]

export default function LayoutAdmin({ children, title, subtitle }: LayoutProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  async function handleLogout() {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <>
      <header className="site-header">
        <Logo size={32} className="site-header__logo" />
        <div>
          <div className="site-header__title">{title}</div>
          {subtitle && <div className="site-header__sub">{subtitle}</div>}
        </div>
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {user?.email && (
            <Text
              fz="xs"
              ff="var(--font)"
              c="rgba(255,255,255,0.85)"
              visibleFrom="xs"
            >
              {user.email}
            </Text>
          )}
          <ActionIcon
            variant="subtle"
            color="white"
            onClick={handleLogout}
            aria-label="Đăng xuất"
            styles={{ root: { color: '#fff' } }}
          >
            <IconLogout size={20} />
          </ActionIcon>
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
