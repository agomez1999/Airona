import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { adminGetStats } from '@/services/api/endpoints'
import { formatCurrency } from '@/lib/formatCurrency'
import { IconVouchers, IconStats, IconProducts, IconOrders, IconPromotions, IconTrendingUp } from '@/components/ui/icons'
import { listItem } from '@/lib/motion'
import type { LucideIcon } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  active: '#C9A84C',
  redeemed: '#22c55e',
  expired: '#9ca3af',
  pending_payment: '#3b82f6',
  refunded: '#f97316',
  cancelled: '#ef4444',
}

function KpiCard({ label, value, sub, linkTo, icon: Icon, index = 0 }: {
  label: string
  value: string
  sub?: string
  linkTo?: string
  icon?: LucideIcon
  index?: number
}) {
  const inner = (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <p className="admin-stat-label">{label}</p>
        {Icon && <Icon size={18} className="text-brand-gold opacity-60 flex-shrink-0" />}
      </div>
      <p className="admin-stat-value">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
  return (
    <motion.div variants={listItem} custom={index} initial="hidden" animate="visible">
      {linkTo ? <Link to={linkTo} className="block">{inner}</Link> : inner}
    </motion.div>
  )
}

const ORDER_STATUS_BADGES: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  pending_payment: 'bg-blue-100 text-blue-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-gray-100 text-gray-600',
}

export function DashboardPage() {
  const { t, i18n } = useTranslation('admin')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminGetStats().then(r => r.data.data),
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-gray-100 rounded-xl" />
          <div className="h-72 bg-gray-100 rounded-xl" />
        </div>
      </div>
    )
  }

  const monthlyData = data.monthly_revenue.map(m => ({
    name: new Date(m.month + '-01').toLocaleString(i18n.language, { month: 'short' }),
    revenue: m.revenue_cents / 100,
  }))

  const pieData = data.voucher_status_distribution.map(d => ({
    name: d.status,
    value: d.count,
  }))

  return (
    <div className="space-y-6">
      <h1 className="admin-page-title">{t('dashboard.title')}</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard index={0} label={t('dashboard.vouchersMonth')} value={String(data.vouchers_sold_month)} icon={IconVouchers} />
        <KpiCard index={1} label={t('dashboard.revenueMonth')} value={formatCurrency(data.revenue_month_cents)} icon={IconStats} />
        <KpiCard
          index={2}
          label={t('dashboard.activeVouchers')}
          value={String(data.active_vouchers)}
          sub={`${data.expiring_30_days} ${t('dashboard.expiringIn30d')}`}
          icon={IconVouchers}
        />
        <KpiCard index={3} label={t('dashboard.pendingRefunds')} value={String(data.pending_refunds)} />
        <KpiCard
          index={4}
          label={t('dashboard.totalProducts')}
          value={String(data.total_products ?? 0)}
          icon={IconProducts}
          linkTo="/admin/products"
        />
        <KpiCard
          index={5}
          label={t('dashboard.totalOrders')}
          value={String(data.total_orders ?? 0)}
          icon={IconOrders}
          linkTo="/admin/orders"
        />
        <KpiCard
          index={6}
          label={t('dashboard.activePromotions')}
          value={String(data.active_promotions ?? 0)}
          icon={IconPromotions}
          linkTo="/admin/promotions"
        />
        <KpiCard
          index={7}
          label={t('dashboard.ordersMonth')}
          value={String(data.orders_this_month ?? 0)}
          icon={IconTrendingUp}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('dashboard.revenueChart')}</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `€${v}`} />
              <Tooltip formatter={(v) => [`€${Number(v ?? 0).toFixed(0)}`, t('dashboard.revenueMonth')]} />
              <Bar dataKey="revenue" fill="#C9A84C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Voucher status pie */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('dashboard.voucherStatusChart')}</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.name] ?? '#e5e7eb'} />
                ))}
              </Pie>
              <Tooltip formatter={(v, name) => [v, String(name)]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[d.name] ?? '#e5e7eb' }} />
                  <span className="text-gray-500 capitalize">{d.name.replace('_', ' ')}</span>
                </div>
                <span className="font-medium text-gray-700">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">{t('dashboard.recentOrders')}</h2>
          <Link to="/admin/orders" className="text-xs text-brand-gold hover:underline">{t('dashboard.viewAll')}</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                <th className="px-5 py-2.5 text-left font-medium">{t('orders.colOrder')}</th>
                <th className="px-5 py-2.5 text-left font-medium">{t('orders.colCustomer')}</th>
                <th className="px-5 py-2.5 text-left font-medium">{t('orders.colTotal')}</th>
                <th className="px-5 py-2.5 text-left font-medium">{t('orders.colStatus')}</th>
                <th className="px-5 py-2.5 text-left font-medium">{t('orders.colDate')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.recent_orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-brand-gold">{order.order_number}</td>
                  <td className="px-5 py-3 text-gray-700">{order.customer_email}</td>
                  <td className="px-5 py-3 font-medium">{formatCurrency(order.total_cents)}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ORDER_STATUS_BADGES[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {new Date(order.created_at).toLocaleDateString(i18n.language)}
                  </td>
                </tr>
              ))}
              {data.recent_orders.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-sm">{t('orders.empty')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
