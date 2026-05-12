import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Center, Loader } from '@mantine/core'
import { useAuth } from '../../contexts/AuthContext'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <Center h="100vh">
        <Loader color="teal" />
      </Center>
    )
  }

  if (!user) {
    return (
      <Navigate to="/admin/login" replace state={{ from: location }} />
    )
  }

  return <>{children}</>
}
