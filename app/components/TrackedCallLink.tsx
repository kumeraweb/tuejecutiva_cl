'use client'

import type { AnchorHTMLAttributes, MouseEvent } from 'react'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

type TrackedCallLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  conversionSendTo?: string
}

export default function TrackedCallLink({
  href,
  target,
  rel,
  onClick,
  conversionSendTo,
  ...props
}: TrackedCallLinkProps) {
  const safeRel = target === '_blank' ? (rel ?? 'noopener noreferrer') : rel

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented || !href || href === '#') {
      return
    }

    const navigate = () => {
      if (target === '_blank') {
        window.open(href, '_blank', 'noopener,noreferrer')
        return
      }
      window.location.href = href
    }

    if (conversionSendTo && typeof window.gtag === 'function') {
      event.preventDefault()

      let navigated = false
      const done = () => {
        if (navigated) return
        navigated = true
        navigate()
      }

      window.gtag('event', 'conversion', {
        send_to: conversionSendTo,
        value: 1.0,
        currency: 'CLP',
        event_callback: done
      })

      window.setTimeout(done, 1200)
      return
    }

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'click_to_call', {
        contact_channel: 'phone',
        destination: href
      })
    }
  }

  return <a {...props} href={href} target={target} rel={safeRel} onClick={handleClick} />
}
