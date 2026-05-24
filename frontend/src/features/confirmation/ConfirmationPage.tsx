import { useEffect, useRef } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { getOrderBySession } from '@/services/api/endpoints'
import { useCartStore } from '@/stores/cartStore'

const POLL_INTERVAL_MS = 2000
const MAX_POLLS = 15 // ~30 seconds

export function ConfirmationPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [searchParams] = useSearchParams()
  const stripeSessionId = sessionId ?? searchParams.get('session_id') ?? ''
  const { clearCart } = useCartStore()
  const cartCleared = useRef(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['order-by-session', stripeSessionId],
    queryFn: () => getOrderBySession(stripeSessionId).then((r) => r.data.data),
    enabled: !!stripeSessionId,
    refetchInterval: (query) => {
      if (query.state.data?.status === 'paid') return false
      if (query.state.dataUpdateCount >= MAX_POLLS) return false
      return POLL_INTERVAL_MS
    },
    retry: 2,
  })

  const order = data
  const isPending = isLoading || (order?.status === 'pending_payment')
  const timedOut = !isLoading && order?.status === 'pending_payment'

  useEffect(() => {
    if (order?.status === 'paid' && !cartCleared.current) {
      cartCleared.current = true
      clearCart()
    }
  }, [order?.status, clearCart])

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100)

  function renderContent() {
    if (!stripeSessionId || isError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-8">
          <div className="text-5xl">⚠️</div>
          <h1 className="text-2xl font-semibold text-gray-900">Pedido no encontrado</h1>
          <p className="text-gray-500">No pudimos encontrar tu pedido. Revisa tu email.</p>
          <Link to="/" className="text-gray-900 underline">
            Volver al inicio
          </Link>
        </div>
      )
    }

    if (isPending && !timedOut) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center p-8">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Procesando tu pago…</h1>
            <p className="text-gray-500 mt-2">Esto puede tardar unos segundos.</p>
          </div>
        </div>
      )
    }

    if (!order || timedOut) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-8">
          <div className="text-5xl">📧</div>
          <h1 className="text-2xl font-semibold text-gray-900">Verificando tu pago</h1>
          <p className="text-gray-500 max-w-sm">
            La confirmación puede tardar unos minutos. Recibirás un email con tus vales en breve.
          </p>
          <Link to="/" className="text-gray-900 underline">
            Volver al inicio
          </Link>
        </div>
      )
    }

    if (order.status === 'failed' || order.status === 'cancelled') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-8">
          <div className="text-5xl">❌</div>
          <h1 className="text-2xl font-semibold text-gray-900">Pago no completado</h1>
          <p className="text-gray-500">El pago no pudo procesarse. No se ha cobrado nada.</p>
          <Link
            to="/carrito"
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Volver al carrito
          </Link>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-6">🎈</div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">¡Compra confirmada!</h1>
          <p className="text-gray-600 mb-2">
            Pedido <span className="font-semibold">{order.order_number}</span>
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Recibirás tus vales en <span className="font-medium">{order.customer_email}</span>
          </p>

          {order.vouchers && order.vouchers.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Tus vales
              </h2>
              <ul className="space-y-3">
                {order.vouchers.map((v) => (
                  <li
                    key={v.code}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="text-left">
                      <p className="font-mono font-semibold text-gray-900 tracking-wider text-sm">
                        {v.code}
                      </p>
                      {v.expires_at && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Válido hasta{' '}
                          {new Date(v.expires_at).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                    {v.pdf_ready && (
                      <a
                        href={`/api/v1/vouchers/${v.code}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                      >
                        Descargar PDF
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-sm text-gray-500 mb-8">
            Total pagado:{' '}
            <span className="font-semibold text-gray-900">{formatPrice(order.total_cents)}</span>
          </p>

          <Link
            to="/"
            className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet><meta name="robots" content="noindex,nofollow" /></Helmet>
      {renderContent()}
    </>
  )
}
