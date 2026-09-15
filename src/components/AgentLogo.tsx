import { useId } from 'react'

/** Four-pointed star, waist pulled tight to the centre so the spikes stay slim. */
const STAR =
  'M24 2 C24.2 23 25 23.8 46 24 C25 24.2 24.2 25 24 46 C23.8 25 23 24.2 2 24 C23 23.8 23.8 23 24 2 Z'

/** Ring drawn as four quarter arcs, notched at the poles and the equator. */
const ARCS = [
  'M22.34 5.07 A19 19 0 0 0 5.07 22.34',
  'M25.66 5.07 A19 19 0 0 1 42.93 22.34',
  'M5.07 25.66 A19 19 0 0 0 22.34 42.93',
  'M42.93 25.66 A19 19 0 0 1 25.66 42.93',
]

/**
 * The agent's logo: grey and still when idle, cyan and pulsing while working.
 */
export function AgentLogo({
  size = 20,
  active = false,
}: {
  size?: number
  active?: boolean
}) {
  const uid = useId()
  const gradId = `${uid}-grad`
  const glowId = `${uid}-glow`

  return (
    <span
      className={`agent-logo${active ? ' is-active' : ''}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 48">
        <defs>
          <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="22%" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
          <filter
            id={glowId}
            x="-60%"
            y="-60%"
            width="220%"
            height="220%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="1.4" />
          </filter>
        </defs>

        {/* Blurred copy behind the crisp mark supplies the halo. */}
        <g className="logo-glow" filter={`url(#${glowId})`}>
          <path d={STAR} fill={`url(#${gradId})`} />
          <circle cx="24" cy="24" r="2.4" fill="currentColor" />
        </g>

        <g className="logo-arcs">
          {ARCS.map((d) => (
            <path key={d} className="logo-arc" d={d} />
          ))}
        </g>

        <path className="logo-star" d={STAR} fill={`url(#${gradId})`} />
        <circle className="logo-core" cx="24" cy="24" r="1.5" />
      </svg>
    </span>
  )
}
