interface Icon {
  size?: number
  className?: string
}

interface NavItem {
  to: string
  label: string
  Icon: any
}

interface LayoutProps {
  children: any
  title: string
  subtitle?: string
  icon?: any
}

interface LayoutAdminProps {
  children: any
  title: string
  subtitle?: string
  icon?: any
}
