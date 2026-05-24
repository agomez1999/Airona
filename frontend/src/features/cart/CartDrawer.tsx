import { AnimatePresence, motion } from 'framer-motion'
import { useCartStore, useCartTotal } from '@/stores/cartStore'
import { Link } from 'react-router-dom'
import { drawerVariants, drawerOverlayVariants } from '@/lib/motion'

export function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, removeItem, updateQuantity } = useCartStore()
  const { subtotal, discount, total } = useCartTotal()

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100)

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            variants={drawerOverlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <motion.aside
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            aria-label="Cart"
            variants={drawerVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Tu carrito</h2>
              <button
                onClick={closeDrawer}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                aria-label="Cerrar carrito"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <p className="text-gray-500 text-center mt-12">Tu carrito está vacío</p>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item.productId} className="flex gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-sm text-gray-500">{formatPrice(item.priceCents)} / unidad</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-7 h-7 rounded-full border flex items-center justify-center text-gray-600 hover:bg-gray-50"
                            aria-label="Reducir cantidad"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-7 h-7 rounded-full border flex items-center justify-center text-gray-600 hover:bg-gray-50"
                            aria-label="Aumentar cantidad"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(item.priceCents * item.quantity)}</p>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-xs text-red-500 hover:text-red-700 mt-1"
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t p-6 space-y-4">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento</span>
                      <span>−{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-base pt-1 border-t">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
                <Link
                  to="/carrito"
                  onClick={closeDrawer}
                  className="block w-full bg-gray-900 text-white text-center py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Ver carrito y tramitar
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
