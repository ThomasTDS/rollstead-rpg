const GAP = 8
const MARGIN = 8

interface Box {
  top: number
  bottom: number
  left: number
}

interface Size {
  width: number
  height: number
}

/** Below the anchor when it fits, above otherwise, and always inside the viewport width. */
export function floatingPosition(anchor: Box, floating: Size, viewport: Size) {
  const fitsBelow = anchor.bottom + GAP + floating.height <= viewport.height - MARGIN
  const top = fitsBelow ? anchor.bottom + GAP : anchor.top - GAP - floating.height
  const rightmost = viewport.width - floating.width - MARGIN
  return {
    top: Math.max(top, MARGIN),
    left: Math.max(Math.min(anchor.left, rightmost), MARGIN),
  }
}

/** Places an open popover next to its anchor, in page coordinates so it follows the scroll. */
export function placeFloating(anchor: HTMLElement, floating: HTMLElement) {
  floating.style.inset = 'auto'
  const { top, left } = floatingPosition(
    anchor.getBoundingClientRect(),
    floating.getBoundingClientRect(),
    { width: document.documentElement.clientWidth, height: window.innerHeight },
  )
  floating.style.top = `${String(top + window.scrollY)}px`
  floating.style.left = `${String(left + window.scrollX)}px`
}
