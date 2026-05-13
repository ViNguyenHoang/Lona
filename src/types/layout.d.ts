interface LayoutProps {
  children: import('react').ReactNode
  title: string
  subtitle?: string
}

interface NavItem {
  to: string
  label: string
  Icon: import('react').ComponentType<{ size?: number; className?: string }>
}
