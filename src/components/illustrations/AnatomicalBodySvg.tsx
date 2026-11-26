import { motion, useReducedMotion, type MotionValue } from 'framer-motion'
import {
  BODY_REGIONS,
  type BodyRegionId,
} from '../../features/symptom-check/bodyRegions'

export interface AnatomicalBodySvgProps {
  activeRegions?: BodyRegionId[]
  focusedRegion?: BodyRegionId | null
  urgentRegions?: BodyRegionId[]
  onSelectRegion?: (region: BodyRegionId) => void
  onHoverRegion?: (region: BodyRegionId | null) => void
  showHotspots?: boolean
  showCallouts?: boolean
  revealPathLength?: MotionValue<number>
  themeMode?: 'light' | 'story'
  className?: string
}

const HUMAN_SILHOUETTE_PATH =
  'M 210 34 C 194 34 185 46 186 64 C 187 79 194 90 201 95 L 199 109 C 188 116 164 120 152 128 C 141 136 135 148 131 168 L 122 216 L 114 268 C 112 281 114 294 120 296 C 126 297 130 284 134 266 L 143 218 L 154 170 C 156 188 161 206 164 224 C 166 238 166 250 162 268 C 157 290 157 316 160 348 L 166 416 C 164 452 167 488 172 518 C 171 528 169 534 177 535 C 185 535 189 528 190 516 C 194 486 196 450 197 416 L 201 344 C 204 338 207 336 210 336 C 213 336 216 338 219 344 L 223 416 C 224 450 226 486 230 516 C 231 528 235 535 243 535 C 251 534 249 528 248 518 C 253 488 256 452 254 416 L 260 348 C 263 316 263 290 258 268 C 254 250 254 238 256 224 C 259 206 264 188 266 170 L 277 218 L 286 266 C 290 284 294 297 300 296 C 306 294 308 281 306 268 L 298 216 L 289 168 C 285 148 279 136 268 128 C 256 120 232 116 221 109 L 219 95 C 226 90 233 79 234 64 C 235 46 226 34 210 34 Z'

/**
 * Custom editorial human-body anatomical SVG illustration with subtle body-system
 * visualizations, scroll-drawable contours, and accessible anatomical hotspots.
 */
export function AnatomicalBodySvg({
  activeRegions = [],
  focusedRegion = null,
  urgentRegions = [],
  onSelectRegion,
  onHoverRegion,
  showHotspots = true,
  showCallouts = false,
  revealPathLength,
  className = '',
}: AnatomicalBodySvgProps) {
  const prefersReduced = useReducedMotion()

  const isRegionActive = (id: BodyRegionId) =>
    focusedRegion === id || activeRegions.includes(id)

  const isRegionUrgent = (id: BodyRegionId) => urgentRegions.includes(id)

  const getStrokeForRegion = (id: BodyRegionId, defaultStroke: string) => {
    if (isRegionUrgent(id)) return '#B4372E'
    if (isRegionActive(id)) {
      if (id === 'head-throat' || id === 'stomach-digestion') return '#C25941'
      return '#174B42'
    }
    return defaultStroke
  }

  return (
    <div
      className={`relative mx-auto aspect-[3/4] w-full select-none ${className}`}
    >
      <svg
        viewBox="0 0 420 560"
        fill="none"
        role="img"
        aria-label="Respectful anatomical human body visualization showing key symptom regions and systems"
        className="h-full w-full overflow-visible"
      >
        <defs>
          <radialGradient id="vitalora-body-warmth" cx="50%" cy="42%" r="48%">
            <stop offset="0%" stopColor="#E4EDE8" stopOpacity="0.85" />
            <stop offset="68%" stopColor="#F0ECE3" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#F9F7F2" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="vitalora-hotspot-sage" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#174B42" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#174B42" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="vitalora-hotspot-coral" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C25941" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#C25941" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="vitalora-hotspot-urgent" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#B4372E" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#B4372E" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="vitalora-silhouette-fill" x1="210" y1="34" x2="210" y2="535" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FAF9F5" />
            <stop offset="52%" stopColor="#F3EFE6" />
            <stop offset="100%" stopColor="#ECE7DC" />
          </linearGradient>
        </defs>

        {/* Calibration orbital aura behind silhouette */}
        <circle cx="210" cy="252" r="184" fill="url(#vitalora-body-warmth)" />
        <circle
          cx="210"
          cy="252"
          r="156"
          stroke="#CAC4B6"
          strokeWidth="0.9"
          strokeDasharray="4 7"
        />
        <circle
          cx="210"
          cy="252"
          r="192"
          stroke="#5B8577"
          strokeOpacity="0.22"
          strokeWidth="0.9"
        />

        {/* Subtle anatomical axis and symmetry guides */}
        <line
          x1="210"
          y1="20"
          x2="210"
          y2="544"
          stroke="#CAC4B6"
          strokeOpacity="0.55"
          strokeWidth="0.8"
          strokeDasharray="3 5"
        />
        <line
          x1="104"
          y1="178"
          x2="316"
          y2="178"
          stroke="#CAC4B6"
          strokeOpacity="0.35"
          strokeWidth="0.75"
        />
        <line
          x1="118"
          y1="253"
          x2="302"
          y2="253"
          stroke="#CAC4B6"
          strokeOpacity="0.35"
          strokeWidth="0.75"
        />

        {/* Ground poise shadow */}
        <ellipse
          cx="210"
          cy="539"
          rx="62"
          ry="7"
          fill="#18201E"
          fillOpacity="0.06"
        />

        {/* Sculpted neutral human body fill + architectural outer outline */}
        <motion.path
          d={HUMAN_SILHOUETTE_PATH}
          fill="url(#vitalora-silhouette-fill)"
          stroke="#444E4A"
          strokeWidth="1.65"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={
            !prefersReduced && revealPathLength
              ? { pathLength: revealPathLength }
              : undefined
          }
          initial={!prefersReduced && !revealPathLength ? { pathLength: 0 } : false}
          animate={!prefersReduced && !revealPathLength ? { pathLength: 1 } : undefined}
          transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Collarbone & sub-diaphragm subtle structural anatomy contours */}
        <path
          d="M 164 132 C 181 124 196 126 207 132 M 256 132 C 239 124 224 126 213 132"
          stroke="#8E9690"
          strokeOpacity="0.55"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <path
          d="M 171 215 Q 210 198 249 215"
          stroke="#8E9690"
          strokeOpacity="0.45"
          strokeWidth="1"
          strokeDasharray="3 4"
          strokeLinecap="round"
        />

        {/* REGION 01: Head, Cranial & Upper Airway System */}
        <g>
          {isRegionActive('head-throat') ? (
            <circle
              cx="210"
              cy="66"
              r="36"
              fill={
                isRegionUrgent('head-throat')
                  ? 'url(#vitalora-hotspot-urgent)'
                  : 'url(#vitalora-hotspot-coral)'
              }
            />
          ) : null}

          <motion.path
            d="M 210 43 C 199 43 194 52 195 62 C 196 68 202 72 210 72 C 218 72 224 68 225 62 C 226 52 221 43 210 43 Z"
            fill={isRegionActive('head-throat') ? '#F7EAE4' : '#E9E4D8'}
            fillOpacity={isRegionActive('head-throat') ? 0.95 : 0.65}
            stroke={getStrokeForRegion('head-throat', '#7D8781')}
            strokeWidth={isRegionActive('head-throat') ? 1.6 : 1.05}
          />
          <motion.path
            d="M 210 72 V 126 M 203 55 Q 210 49 217 55 M 201 63 Q 210 58 219 63"
            stroke={getStrokeForRegion('head-throat', '#7D8781')}
            strokeWidth={isRegionActive('head-throat') ? 1.5 : 1}
            strokeLinecap="round"
          />
        </g>

        {/* REGION 02: Thoracic, Lungs & Cardiac Rhythm */}
        <g>
          {isRegionActive('chest-breathing') ? (
            <circle
              cx="210"
              cy="178"
              r="54"
              fill={
                isRegionUrgent('chest-breathing')
                  ? 'url(#vitalora-hotspot-urgent)'
                  : 'url(#vitalora-hotspot-sage)'
              }
            />
          ) : null}

          {/* Right & Left Lungs (respectful paired anatomical contour) */}
          <motion.path
            d="M 205 147 C 189 144 174 156 171 178 C 169 194 174 205 186 207 C 197 208 205 201 206 189 Z"
            fill={
              isRegionUrgent('chest-breathing')
                ? '#FCECEB'
                : isRegionActive('chest-breathing')
                  ? '#D8EAE2'
                  : '#E6EAE5'
            }
            fillOpacity={isRegionActive('chest-breathing') ? 0.92 : 0.65}
            stroke={getStrokeForRegion('chest-breathing', '#7D8781')}
            strokeWidth={isRegionActive('chest-breathing') ? 1.65 : 1.1}
          />
          <motion.path
            d="M 215 147 C 231 144 246 156 249 178 C 251 194 246 205 234 207 C 223 208 215 201 214 189 Z"
            fill={
              isRegionUrgent('chest-breathing')
                ? '#FCECEB'
                : isRegionActive('chest-breathing')
                  ? '#D8EAE2'
                  : '#E6EAE5'
            }
            fillOpacity={isRegionActive('chest-breathing') ? 0.92 : 0.65}
            stroke={getStrokeForRegion('chest-breathing', '#7D8781')}
            strokeWidth={isRegionActive('chest-breathing') ? 1.65 : 1.1}
          />
          {/* Bronchial bifurcation */}
          <path
            d="M 210 126 V 150 M 210 150 L 194 166 M 210 150 L 226 166"
            stroke={getStrokeForRegion('chest-breathing', '#7D8781')}
            strokeWidth={isRegionActive('chest-breathing') ? 1.6 : 1.1}
            strokeLinecap="round"
          />

          {/* Subtle cardiac position accent */}
          <circle
            cx="220"
            cy="179"
            r="7"
            fill={isRegionUrgent('chest-breathing') ? '#B4372E' : '#C25941'}
            fillOpacity={isRegionActive('chest-breathing') ? 0.85 : 0.32}
          />
          {!prefersReduced && isRegionActive('chest-breathing') ? (
            <motion.circle
              cx="220"
              cy="179"
              r="7"
              stroke={isRegionUrgent('chest-breathing') ? '#B4372E' : '#174B42'}
              strokeWidth="1.3"
              animate={{ r: [7, 22], opacity: [0.65, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
            />
          ) : null}
        </g>

        {/* REGION 03: Abdominal & Digestive Core */}
        <g>
          {isRegionActive('stomach-digestion') ? (
            <circle
              cx="210"
              cy="253"
              r="46"
              fill="url(#vitalora-hotspot-coral)"
            />
          ) : null}

          <motion.path
            d="M 192 228 C 180 236 178 256 188 269 C 198 282 222 282 232 269 C 242 256 240 236 228 228 C 218 222 202 222 192 228 Z"
            fill={isRegionActive('stomach-digestion') ? '#F7EAE4' : '#ECE7DE'}
            fillOpacity={isRegionActive('stomach-digestion') ? 0.92 : 0.58}
            stroke={getStrokeForRegion('stomach-digestion', '#8B877E')}
            strokeWidth={isRegionActive('stomach-digestion') ? 1.65 : 1.05}
          />
          <path
            d="M 197 248 C 204 240 218 241 222 250 C 226 259 214 267 203 263"
            stroke={getStrokeForRegion('stomach-digestion', '#8B877E')}
            strokeWidth={isRegionActive('stomach-digestion') ? 1.45 : 1}
            strokeLinecap="round"
          />
        </g>

        {/* REGION 04: Spine, Joints, Muscles & Systemic Equilibrium */}
        <g>
          {isRegionActive('body-spine-skin') ? (
            <circle
              cx="180"
              cy="420"
              r="46"
              fill={
                isRegionUrgent('body-spine-skin')
                  ? 'url(#vitalora-hotspot-urgent)'
                  : 'url(#vitalora-hotspot-sage)'
              }
            />
          ) : null}

          {/* Spinal vertebral index marks */}
          {[118, 130, 142, 154, 166, 200, 212, 224, 286, 298].map((yPos) => (
            <line
              key={yPos}
              x1="206"
              y1={yPos}
              x2="214"
              y2={yPos}
              stroke={getStrokeForRegion('body-spine-skin', '#8E9690')}
              strokeWidth={isRegionActive('body-spine-skin') ? 1.6 : 1.05}
              strokeLinecap="round"
            />
          ))}

          {/* Bilateral shoulder, hip, and knee joint articulation nodes */}
          {[
            { cx: 155, cy: 136 },
            { cx: 265, cy: 136 },
            { cx: 174, cy: 304 },
            { cx: 246, cy: 304 },
            { cx: 180, cy: 420 },
            { cx: 240, cy: 420 },
          ].map((joint, idx) => (
            <g key={idx}>
              <circle
                cx={joint.cx}
                cy={joint.cy}
                r="7.5"
                stroke={getStrokeForRegion('body-spine-skin', '#969D98')}
                strokeOpacity={isRegionActive('body-spine-skin') ? 0.9 : 0.48}
                strokeWidth={isRegionActive('body-spine-skin') ? 1.4 : 0.9}
                strokeDasharray="2 2.5"
              />
              <circle
                cx={joint.cx}
                cy={joint.cy}
                r="2.4"
                fill={getStrokeForRegion('body-spine-skin', '#969D98')}
                fillOpacity={isRegionActive('body-spine-skin') ? 0.95 : 0.45}
              />
            </g>
          ))}
        </g>

        {/* Fine desktop leader lines + subtle anatomical labels (when showCallouts=true) */}
        {showCallouts
          ? BODY_REGIONS.map((region) => {
              const active = isRegionActive(region.id)
              const urgent = isRegionUrgent(region.id)
              const stroke = urgent
                ? '#B4372E'
                : active
                  ? region.accentHex
                  : '#9FA6A0'
              const isRight = region.calloutTargetSvg.align === 'right'
              const elbowX = isRight
                ? region.anchorSvg.x + 42
                : region.anchorSvg.x - 42

              return (
                <g key={region.id} className="pointer-events-none hidden sm:inline">
                  <path
                    d={`M ${region.anchorSvg.x} ${region.anchorSvg.y} L ${elbowX} ${region.calloutTargetSvg.y} L ${region.calloutTargetSvg.x} ${region.calloutTargetSvg.y}`}
                    stroke={stroke}
                    strokeOpacity={active ? 0.9 : 0.45}
                    strokeWidth={active ? 1.3 : 0.9}
                    fill="none"
                  />
                  <circle
                    cx={region.anchorSvg.x}
                    cy={region.anchorSvg.y}
                    r={active ? 4.2 : 3}
                    fill={active ? stroke : '#F9F7F2'}
                    stroke={stroke}
                    strokeWidth="1.4"
                  />
                  <text
                    x={isRight ? region.calloutTargetSvg.x + 6 : region.calloutTargetSvg.x - 6}
                    y={region.calloutTargetSvg.y + 4}
                    textAnchor={isRight ? 'start' : 'end'}
                    fill={active ? '#18201E' : '#6E756F'}
                    fontSize="11"
                    fontWeight={active ? '600' : '500'}
                    fontFamily="Plus Jakarta Sans, sans-serif"
                  >
                    {region.shortLabel}
                  </text>
                </g>
              )
            })
          : null}
      </svg>

      {/* Keyboard & screen-reader accessible anatomical hotspot triggers */}
      {showHotspots && onSelectRegion ? (
        <div className="pointer-events-none absolute inset-0">
          {BODY_REGIONS.map((region) => {
            const active = isRegionActive(region.id)
            const urgent = isRegionUrgent(region.id)
            return (
              <button
                key={region.id}
                type="button"
                aria-label={`Select ${region.title} region`}
                aria-pressed={active}
                onClick={() => onSelectRegion(region.id)}
                onMouseEnter={() => onHoverRegion?.(region.id)}
                onMouseLeave={() => onHoverRegion?.(null)}
                style={{
                  left: `${region.hotspotPercent.x}%`,
                  top: `${region.hotspotPercent.y}%`,
                }}
                className="pointer-events-auto group absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
              >
                <span
                  className={`absolute inset-1 rounded-full transition-transform duration-200 group-hover:scale-125 ${
                    urgent
                      ? 'bg-urgent/20 ring-2 ring-urgent'
                      : active
                        ? 'bg-coral/20 ring-2 ring-coral'
                        : 'bg-forest/10 ring-1 ring-forest/40 group-hover:bg-coral/15 group-hover:ring-coral'
                  }`}
                />
                <span
                  className={`relative h-2.5 w-2.5 rounded-full transition-colors ${
                    urgent
                      ? 'bg-urgent'
                      : active
                        ? 'bg-coral'
                        : 'bg-forest group-hover:bg-coral'
                  }`}
                />
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
