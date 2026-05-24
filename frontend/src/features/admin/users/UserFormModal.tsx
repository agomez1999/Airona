import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { BaseModal } from '@/components/ui/BaseModal'
import { adminCreateUser, adminUpdateUser } from '@/services/api/endpoints'
import type { AdminUser } from '@/services/api/types/experience.types'

interface UserFormModalProps {
  user: AdminUser | null
  open: boolean
  onClose: () => void
}

const BLANK_FORM = { name: '', email: '', password: '', role: 'admin' as AdminUser['role'] }

export function UserFormModal({ user, open, onClose }: UserFormModalProps) {
  const { t } = useTranslation('admin')
  const qc = useQueryClient()
  const [form, setForm] = useState(BLANK_FORM)
  const [error, setError] = useState('')

  // Populate form from user when modal opens in edit mode; reset when creating or closing
  useEffect(() => {
    if (open && user) {
      setForm({ name: user.name, email: user.email, password: '', role: user.role })
    } else {
      setForm(BLANK_FORM)
      setError('')
    }
  }, [open, user])

  const create = useMutation({
    mutationFn: () => adminCreateUser({ name: form.name, email: form.email, password: form.password, role: form.role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      onClose()
      setForm(BLANK_FORM)
      setError('')
    },
    onError: (e: unknown) =>
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? t('auth.errorGeneric')),
  })

  const update = useMutation({
    mutationFn: () => adminUpdateUser(user!.id, { name: form.name, email: form.email, role: form.role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      onClose()
      setForm(BLANK_FORM)
      setError('')
    },
    onError: (e: unknown) =>
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? t('auth.errorGeneric')),
  })

  const isPending = create.isPending || update.isPending

  function handleSubmit() {
    setError('')
    if (user) {
      update.mutate()
    } else {
      create.mutate()
    }
  }

  const footer = (
    <>
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
      >
        {t('users.formCancel')}
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending}
        className="px-5 py-2 rounded-lg bg-brand-gold text-white text-sm font-semibold hover:bg-brand-gold/90 disabled:opacity-60 transition-colors"
      >
        {isPending ? t('users.formSaving') : t('users.formSave')}
      </button>
    </>
  )

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={user ? user.name : t('users.new')}
      size="sm"
      footer={footer}
    >
      <div className="px-6 py-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('users.formName')}</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('users.formEmail')}</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
            />
          </div>
          {!user && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{t('users.formPassword')}</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('users.formRole')}</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value as AdminUser['role'] }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
            >
              <option value="admin">{t('users.roleAdmin')}</option>
              <option value="superadmin">{t('users.roleSuperadmin')}</option>
            </select>
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
      </div>
    </BaseModal>
  )
}
