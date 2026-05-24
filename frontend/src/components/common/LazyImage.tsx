import { useRef, useState, useEffect } from 'react'
import { cn } from '@/lib/cn'

interface Props {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  objectFit?: 'cover' | 'contain' | 'fill'
}

export function LazyImage({ src, alt, width, height, className, priority = false, objectFit = 'cover' }: Props) {
  const ref = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(priority)

  useEffect(() => {
    if (priority) return
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true)
        observer.disconnect()
      }
    }, { rootMargin: '200px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [priority])

  return (
    <img
      ref={ref}
      src={inView ? src : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={cn(
        'transition-opacity duration-300',
        objectFit === 'cover' && 'object-cover',
        objectFit === 'contain' && 'object-contain',
        objectFit === 'fill' && 'object-fill',
        !loaded && !priority && 'opacity-0',
        (loaded || priority) && 'opacity-100',
        className,
      )}
    />
  )
}
