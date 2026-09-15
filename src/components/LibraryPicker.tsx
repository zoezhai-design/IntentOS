import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Plus } from 'lucide-react'
import type { Artifact } from '../types'

const MENU_WIDTH = 272
const MENU_MAX_HEIGHT = 320
const GAP = 8
const EDGE = 12

interface LibraryPickerProps {
  library: Artifact[]
  placedIds: Set<string>
  disabled?: boolean
  label?: string
  onPick: (artifactId: string) => void
}

/**
 * Add control with a dropdown of everything in the library. The menu renders in
 * a portal with fixed positioning so it floats above the layout instead of
 * being clipped by the card it sits in.
 */
export function LibraryPicker({
  library,
  placedIds,
  disabled,
  label = 'Add',
  onPick,
}: LibraryPickerProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!open) return

    function place() {
      const trigger = triggerRef.current?.getBoundingClientRect()
      if (!trigger) return

      const height = Math.min(
        menuRef.current?.offsetHeight ?? MENU_MAX_HEIGHT,
        MENU_MAX_HEIGHT,
      )
      const flipUp =
        trigger.bottom + GAP + height > window.innerHeight - EDGE &&
        trigger.top - GAP - height > EDGE

      setPos({
        top: flipUp ? trigger.top - GAP - height : trigger.bottom + GAP,
        left: Math.min(
          Math.max(EDGE, trigger.left),
          window.innerWidth - MENU_WIDTH - EDGE,
        ),
      })
    }

    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setOpen(false)
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        className="picker-trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Plus size={14} />
        {label}
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="picker-menu"
            role="listbox"
            style={{ top: pos.top, left: pos.left, width: MENU_WIDTH }}
          >
            <div className="picker-menu-head">Library</div>
            <div className="picker-menu-scroll">
              {library.map((item) => (
                <button
                  key={item.id}
                  role="option"
                  aria-selected={placedIds.has(item.id)}
                  onClick={() => {
                    onPick(item.id)
                    setOpen(false)
                  }}
                >
                  <span>{item.title}</span>
                  <em>
                    {placedIds.has(item.id) ? 'On workspace' : item.kind}
                  </em>
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
