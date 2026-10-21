import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './contextMenu.css'

// Shared trigger for desktop, touch and keyboard. Items are { label, href? , onSelect? }.
export default function ContextMenuButton({ items, children, onClick, menuLabel, ...props }) {
  const [position, setPosition] = useState(null)
  const trigger = useRef(null)
  const menu = useRef(null)
  const hold = useRef(null)
  const start = useRef(null)
  const consumed = useRef(false)
  const menuId = useId()
  const cancelHold = () => clearTimeout(hold.current)

  function close(restore = true) {
    setPosition(null)
    if (restore) trigger.current?.focus()
  }

  function open(x, y) {
    cancelHold()
    const rect = trigger.current.getBoundingClientRect()
    setPosition({ x: x || rect.left, y: y || rect.bottom })
  }

  useEffect(() => cancelHold, [])
  useLayoutEffect(() => {
    if (!position || !menu.current) return
    const rect = menu.current.getBoundingClientRect()
    menu.current.style.left = `${Math.max(8, Math.min(position.x, window.innerWidth - rect.width - 8))}px`
    menu.current.style.top = `${Math.max(8, Math.min(position.y, window.innerHeight - rect.height - 8))}px`
    menu.current.querySelector('[role="menuitem"]')?.focus()
    const outside = (event) => {
      if (!menu.current?.contains(event.target) && !trigger.current?.contains(event.target)) close(false)
    }
    const dismiss = () => close()
    document.addEventListener('pointerdown', outside, true)
    window.addEventListener('resize', dismiss)
    return () => {
      document.removeEventListener('pointerdown', outside, true)
      window.removeEventListener('resize', dismiss)
    }
  }, [position])

  function menuKeys(event) {
    event.stopPropagation()
    const buttons = [...menu.current.querySelectorAll('[role="menuitem"]')]
    const current = buttons.indexOf(document.activeElement)
    let next
    if (event.key === 'ArrowDown') next = (current + 1) % buttons.length
    else if (event.key === 'ArrowUp') next = (current - 1 + buttons.length) % buttons.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = buttons.length - 1
    else if (event.key === 'Escape') { event.preventDefault(); close(); return }
    else if (event.key === 'Tab') { close(); return }
    else if (event.key.length === 1 && event.key !== ' ') {
      const ordered = [...buttons.slice(current + 1), ...buttons.slice(0, current + 1)]
      const match = ordered.find((button) => button.textContent.trim().toLocaleLowerCase().startsWith(event.key.toLocaleLowerCase()))
      if (match) { event.preventDefault(); match.focus() }
      return
    }
    if (next !== undefined) { event.preventDefault(); buttons[next]?.focus() }
  }

  return (
    <>
      <button
        {...props}
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={Boolean(position)}
        aria-controls={position ? menuId : undefined}
        onClick={(event) => {
          if (consumed.current && event.detail !== 0) { event.preventDefault(); consumed.current = false; return }
          consumed.current = false
          if (position) { close(); return }
          onClick?.(event)
        }}
        onContextMenu={(event) => {
          event.preventDefault()
          event.stopPropagation()
          open(event.clientX, event.clientY)
        }}
        onKeyDown={(event) => {
          if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
            event.preventDefault()
            event.stopPropagation()
            open()
          }
        }}
        onPointerDown={(event) => {
          consumed.current = false
          if (event.pointerType === 'mouse' || !event.isPrimary || event.button !== 0) return
          start.current = { x: event.clientX, y: event.clientY }
          hold.current = setTimeout(() => { consumed.current = true; open(event.clientX, event.clientY) }, 500)
        }}
        onPointerMove={(event) => {
          if (start.current && Math.hypot(event.clientX - start.current.x, event.clientY - start.current.y) > 10) cancelHold()
        }}
        onPointerUp={cancelHold}
        onPointerCancel={cancelHold}
        onPointerLeave={cancelHold}
        style={{ ...props.style, WebkitTouchCallout: 'none', userSelect: 'none' }}
      >{children}</button>
      {position && createPortal(
        <div
          ref={menu}
          id={menuId}
          role="menu"
          aria-label={menuLabel || 'Unterbereiche'}
          onKeyDown={menuKeys}
          onContextMenu={(event) => event.preventDefault()}
          style={{ position: 'fixed', zIndex: 10000, left: position.x, top: position.y, width: 280, maxWidth: 'calc(100vw - 16px)', maxHeight: 'min(420px, calc(100dvh - 16px))', overflowY: 'auto', padding: 6, borderRadius: 16, border: '1px solid var(--line, #475569)', background: 'var(--card, var(--j-card, #172033))', color: 'var(--ink, var(--j-ink, #f1f5f9))', boxShadow: '0 16px 48px #0006' }}
        >
          {items.map(({ label, href, onSelect }, index) => {
            const Tag = href ? 'a' : 'button'
            return (
              <Tag
                key={`${label}-${index}`}
                role="menuitem"
                className="vos-context-menu-item"
                tabIndex={-1}
                href={href}
                type={href ? undefined : 'button'}
                onClick={() => { close(); onSelect?.() }}
                style={{ display: 'block', width: '100%', padding: '10px 12px', border: 0, borderRadius: 10, color: 'inherit', textAlign: 'left', fontSize: 14, textDecoration: 'none', cursor: 'pointer' }}
              >{label}</Tag>
            )
          })}
        </div>, document.body,
      )}
    </>
  )
}
