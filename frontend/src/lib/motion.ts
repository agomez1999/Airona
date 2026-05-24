import type { Variants, Transition } from 'framer-motion'

// ─── Timing constants ────────────────────────────────────────────────────────
export const transitions = {
  micro:  { duration: 0.15, ease: 'easeOut' } as Transition,
  fast:   { duration: 0.2,  ease: 'easeOut' } as Transition,
  normal: { duration: 0.3,  ease: 'easeOut' } as Transition,
  slow:   { duration: 0.4,  ease: 'easeOut' } as Transition,
  spring: { type: 'spring', stiffness: 300, damping: 28 } as Transition,
  springBouncy: { type: 'spring', stiffness: 400, damping: 20 } as Transition,
}

// ─── Page transitions ─────────────────────────────────────────────────────────
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: transitions.normal },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } },
}

// ─── Fade up (hero text, section headings) ────────────────────────────────────
export const fadeUpVariants: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0,  transition: transitions.normal },
}

// ─── Fade in (simple reveal) ──────────────────────────────────────────────────
export const fadeInVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: transitions.normal },
}

// ─── Scale in (cards, badges, icons) ─────────────────────────────────────────
export const scaleInVariants: Variants = {
  hidden:  { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1,    transition: transitions.normal },
}

// ─── Stagger container ────────────────────────────────────────────────────────
export const staggerContainerVariants: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

// ─── Stagger item (child of stagger container) ────────────────────────────────
export const staggerItemVariants: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0,  transition: transitions.normal },
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export const modalOverlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: transitions.fast },
  exit:    { opacity: 0, transition: transitions.fast },
}

export const modalContentVariants: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 12 },
  animate: { opacity: 1, scale: 1,    y: 0,  transition: transitions.normal },
  exit:    { opacity: 0, scale: 0.96, y: 12, transition: { duration: 0.2, ease: 'easeIn' } },
}

// ─── Accordion ────────────────────────────────────────────────────────────────
export const accordionVariants: Variants = {
  collapsed: { height: 0, opacity: 0 },
  expanded:  {
    height: 'auto',
    opacity: 1,
    transition: {
      height:   { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] },
      opacity:  { duration: 0.2, delay: 0.1 },
    },
  },
}

// ─── Drawer (cart, side panels) ───────────────────────────────────────────────
export const drawerVariants: Variants = {
  closed: { x: '100%', opacity: 0 },
  open:   { x: 0,      opacity: 1, transition: transitions.spring },
}

export const drawerOverlayVariants: Variants = {
  closed: { opacity: 0 },
  open:   { opacity: 1, transition: transitions.fast },
}

// ─── Slide in from left (mobile menu) ─────────────────────────────────────────
export const slideInLeftVariants: Variants = {
  closed: { x: '-100%', opacity: 0 },
  open:   { x: 0,       opacity: 1, transition: transitions.spring },
}

// ─── Slide down from top (dropdown menu) ──────────────────────────────────────
export const slideDownVariants: Variants = {
  closed: { opacity: 0, y: -12 },
  open:   { opacity: 1, y: 0,    transition: transitions.fast },
}

// ─── Legacy: kept for backward compatibility ──────────────────────────────────

export const listItem: Variants = {
  hidden:  { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, delay: i * 0.03 },
  }),
}

export const pageTransition = pageVariants

export const modalOverlay = {
  initial:    { opacity: 0 },
  animate:    { opacity: 1 },
  exit:       { opacity: 0 },
  transition: { duration: 0.15 },
}

export const modalContent = {
  initial:    { opacity: 0, scale: 0.97, y: 6 },
  animate:    { opacity: 1, scale: 1, y: 0 },
  exit:       { opacity: 0, scale: 0.97, y: 6 },
  transition: { duration: 0.2, ease: 'easeOut' as const },
}

export const accordionContent = {
  initial:    { height: 0, opacity: 0 },
  animate:    { height: 'auto', opacity: 1 },
  exit:       { height: 0, opacity: 0 },
  transition: { duration: 0.25, ease: 'easeInOut' as const },
}

// ─── Aliases ──────────────────────────────────────────────────────────────────
export const modalOverlayV  = modalOverlayVariants
export const modalContentV  = modalContentVariants
export const accordionContentV = accordionVariants
