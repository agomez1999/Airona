import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import type { AdminUser } from '@/services/api/types/experience.types'

interface Props {
  children: React.ReactNode
  requireRole?: AdminUser['role']
}

export function AdminGuard({ children, requireRole }: Props) {
  const { isAuthenticated, user, fetchMe, isLoading } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      fetchMe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  if (requireRole === 'superadmin' && user?.role !== 'superadmin') {
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}
