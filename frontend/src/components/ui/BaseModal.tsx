import { useEffect, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { IconClose } from './icons'
import { modalOverlayVariants, modalContentVariants } from '@/lib/motion'

const SIZE_CLASSES = {
  sm: 'max-w-lg',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-5xl',
} as const

interface BaseModalProps {
  open: boolean
  onClose: () => void
  title: string
  size?: keyof typeof SIZE_CLASSES
  children: ReactNode
  footer?: ReactNode
}

export function BaseModal({ open, onClose, title, size = 'md', children, footer }: BaseModalProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    containerRef.current?.focus()

    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && onClose()}
          variants={prefersReduced ? undefined : modalOverlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <motion.div
            ref={containerRef}
            tabIndex={-1}
            className={`bg-white rounded-2xl shadow-2xl w-full ${SIZE_CLASSES[size]} max-h-[90vh] flex flex-col outline-none`}
            variants={prefersReduced ? undefined : modalContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h2 className="admin-section-title">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                aria-label="Close"
              >
                <IconClose size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
