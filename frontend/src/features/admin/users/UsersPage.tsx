import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { adminGetUsers, adminDeleteUser } from '@/services/api/endpoints'
import type { AdminUser } from '@/services/api/types/experience.types'
import { UserFormModal } from './UserFormModal'

export function UsersPage() {
  const { t } = useTranslation('admin')
  const qc = useQueryClient()
  const [modalUser, setModalUser] = useState<AdminUser | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminGetUsers().then(r => r.data.data),
    staleTime: 1000 * 60 * 5,
  })

  const remove = useMutation({
    mutationFn: adminDeleteUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  function closeModal() {
    setModalOpen(false)
    setModalUser(null)
  }

  const users = data ?? []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="admin-page-title">{t('users.title')}</h1>
        <button
          onClick={() => { setModalUser(null); setModalOpen(true) }}
          className="px-4 py-2 rounded-lg bg-brand-gold text-white text-sm font-semibold hover:bg-brand-gold/90 transition-colors"
        >
          {t('users.new')}
        </button>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm animate-pulse">{t('common.loading')}</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                <th className="px-5 py-3 text-left font-medium">{t('users.colName')}</th>
                <th className="px-5 py-3 text-left font-medium">{t('users.colEmail')}</th>
                <th className="px-5 py-3 text-left font-medium">{t('users.colRole')}</th>
                <th className="px-5 py-3 text-right font-medium">{t('users.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900">{user.name}</td>
                  <td className="px-5 py-3 text-gray-600">{user.email}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${user.role === 'superadmin' ? 'bg-brand-gold/10 text-brand-gold' : 'bg-gray-100 text-gray-600'}`}>
                      {user.role === 'superadmin' ? t('users.roleSuperadmin') : t('users.roleAdmin')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setModalUser(user); setModalOpen(true) }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => { if (confirm(t('users.deleteConfirm', { name: user.name }))) remove.mutate(user.id) }}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">{t('users.empty')}</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <UserFormModal user={modalUser} open={modalOpen} onClose={closeModal} />
    </div>
  )
}
