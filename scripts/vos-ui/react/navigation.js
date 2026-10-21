const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]'

export function isEditing(target) {
  return target?.isContentEditable || Boolean(target?.closest?.('input, textarea, select, [role="textbox"]'))
}

export function focusableItems(container) {
  return [...container.querySelectorAll(FOCUSABLE)].filter((element) => (
    !element.closest('[inert], [hidden]') && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden'
  ))
}

// Only explicitly marked shell navigation consumes unmodified arrow keys.
// Moving focus never activates a destination; Enter/Space remain native.
export function handleNavigationKeys(event) {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.isComposing || event.nativeEvent?.isComposing || isEditing(event.target)) return
  const group = event.target.closest?.('[data-shell-nav]')
  if (!group) return
  const items = focusableItems(group).filter((item) => item.closest('[data-shell-nav]') === group)
  const index = items.indexOf(event.target)
  if (index < 0) return
  const columns = group.dataset.shellNav === 'grid'
    ? getComputedStyle(group).gridTemplateColumns.split(' ').filter(Boolean).length
    : 1
  let next
  switch (event.key) {
    case 'ArrowRight': next = index + 1; break
    case 'ArrowLeft': next = index - 1; break
    case 'ArrowDown': next = index + columns; break
    case 'ArrowUp': next = index - columns; break
    case 'Home': next = 0; break
    case 'End': next = items.length - 1; break
    default: return
  }
  event.preventDefault()
  event.stopPropagation()
  items[(next % items.length + items.length) % items.length]?.focus()
}

