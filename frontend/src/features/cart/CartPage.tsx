import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useCartStore, useCartTotal } from '@/stores/cartStore'
import { validatePromoCode } from '@/services/api/endpoints'

export function CartPage() {
  const { items, promoCode, promoResult, removeItem, updateQuantity, applyPromo, clearPromo } =
    useCartStore()
  const { subtotal, discount, total } = useCartTotal()

  const navigate = useNavigate()

  const [promoInput, setPromoInput] = useState(promoCode ?? '')
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState<string | null>(null)

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100)

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return
    setPromoLoading(true)
    setPromoError(null)
    try {
      const { data } = await validatePromoCode(promoInput.trim(), subtotal)
      if (data.valid) {
        applyPromo(promoInput.trim().toUpperCase(), data)
      } else {
        setPromoError(data.message ?? 'Código no válido')
        clearPromo()
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Código no válido'
      setPromoError(msg)
      clearPromo()
    } finally {
      setPromoLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <>
        <Helmet><meta name="robots" content="noindex,nofollow" /></Helmet>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-8">
          <h1 className="text-2xl font-semibold text-gray-900">Tu carrito está vacío</h1>
          <p className="text-gray-500">Añade una experiencia para continuar</p>
          <Link
            to="/"
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Ver experiencias
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Helmet><meta name="robots" content="noindex,nofollow" /></Helmet>
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">Tu carrito</h1>

        <div className="bg-white rounded-xl shadow-sm divide-y">
          {items.map((item) => (
            <div key={item.productId} className="p-6 flex gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500 mt-1">{formatPrice(item.priceCents)} / unidad</p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-8 h-8 rounded-full border flex items-center justify-center text-gray-600 hover:bg-gray-50 font-medium"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-8 h-8 rounded-full border flex items-center justify-center text-gray-600 hover:bg-gray-50 font-medium"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="text-right flex flex-col justify-between">
                <p className="font-semibold text-gray-900">
                  {formatPrice(item.priceCents * item.quantity)}
                </p>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Promo code */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">¿Tienes un código promocional?</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => {
                setPromoInput(e.target.value.toUpperCase())
                setPromoError(null)
              }}
              placeholder="CÓDIGO"
              className="flex-1 border rounded-lg px-3 py-2 text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <button
              onClick={handleApplyPromo}
              disabled={promoLoading || !promoInput.trim()}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {promoLoading ? '...' : 'Aplicar'}
            </button>
            {promoResult?.valid && (
              <button
                onClick={() => {
                  clearPromo()
                  setPromoInput('')
                }}
                className="text-sm text-gray-400 hover:text-gray-600 px-2"
              >
                Quitar
              </button>
            )}
          </div>
          {promoError && <p className="text-red-500 text-sm mt-2">{promoError}</p>}
          {promoResult?.valid && (
            <p className="text-green-600 text-sm mt-2">
              ¡Código aplicado! −{formatPrice(promoResult.discount_cents)}
            </p>
          )}
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento ({promoCode})</span>
                <span>−{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-base pt-2 border-t">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="mt-6 w-full bg-gray-900 text-white py-4 rounded-lg font-semibold text-lg hover:bg-gray-700 transition-colors"
          >
            Continuar al pago →
          </button>
        </div>
      </div>
    </div>
    </>
  )
}
