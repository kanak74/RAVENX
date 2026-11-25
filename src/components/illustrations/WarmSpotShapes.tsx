import { motion } from 'framer-motion'

export interface LogoMarkProps {
  className?: string
}

/** Warm illustrated brand mark for VITALORA — friendly coral circle with sunlit leaf-heart. */
export function VitaloraLogoMark({ className = 'h-10 w-10' }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="24" cy="24" r="22" fill="#FF7B61" stroke="#26211D" strokeWidth="2.5" />
      <circle cx="35" cy="13" r="5" fill="#F9CC59" />
      <path
        d="M24 35.5C22.8 35.5 13 28.4 13 20.8C13 16.7 16.1 13.5 20.1 13.5C22.3 13.5 23.6 14.6 24 15.8C24.4 14.6 25.7 13.5 27.9 13.5C31.9 13.5 35 16.7 35 20.8C35 28.4 25.2 35.5 24 35.5Z"
        fill="#FFF9F2"
        stroke="#26211D"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M21 22.5C21.8 23.8 23 24.4 24 24.4C25 24.4 26.2 23.8 27 22.5"
        stroke="#26211D"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Expressive custom SVG scene for the homepage hero establishing VITALORA's warm healthcare style. */
export function HeroCompanionIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-[460px] select-none">
      <motion.svg
        viewBox="0 0 460 400"
        fill="none"
        role="img"
        aria-label="Friendly illustrated health companion holding a green care heart surrounded by warm colorful shapes"
        className="h-auto w-full"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Soft background organic blobs */}
        <path
          d="M366 64C415 104 434 176 418 242C402 308 351 368 281 381C211 394 122 360 71 306C20 252 7 178 29 116C51 54 108 4 179 1C250 -2 317 24 366 64Z"
          fill="#FFF3CC"
        />
        <path
          d="M396 158C423 197 424 253 396 293C368 333 311 357 259 351C207 345 160 309 152 260C144 211 175 149 227 125C279 101 369 119 396 158Z"
          fill="#FDE9EE"
        />
        <circle cx="88" cy="112" r="34" fill="#DFF4E8" />
        <circle cx="384" cy="96" r="22" fill="#FFE5DD" />

        {/* Sunburst dots */}
        <circle cx="116" cy="54" r="6" fill="#FF7B61" />
        <circle cx="394" cy="296" r="8" fill="#F9CC59" />
        <circle cx="72" cy="284" r="7" fill="#2C875C" />

        {/* Cozy floating band-aid accent top-right */}
        <g transform="translate(328 54) rotate(18)">
          <rect x="0" y="0" width="54" height="22" rx="11" fill="#FFE5DD" stroke="#26211D" strokeWidth="2.4" />
          <rect x="17" y="4" width="20" height="14" rx="4" fill="#FFFCF8" />
          <circle cx="24" cy="9" r="1.4" fill="#FF7B61" />
          <circle cx="30" cy="9" r="1.4" fill="#FF7B61" />
          <circle cx="24" cy="13" r="1.4" fill="#FF7B61" />
          <circle cx="30" cy="13" r="1.4" fill="#FF7B61" />
        </g>

        {/* Friendly companion character */}
        <g>
          {/* Soft shadow base */}
          <ellipse cx="228" cy="342" rx="92" ry="15" fill="#EADCCF" />

          {/* Companion cozy rounded body */}
          <path
            d="M142 238C142 174 180 132 230 132C280 132 318 174 318 238C318 295 282 328 230 328C178 328 142 295 142 238Z"
            fill="#FF7B61"
            stroke="#26211D"
            strokeWidth="3.5"
          />

          {/* Warm cream apron/belly patch */}
          <path
            d="M174 252C174 216 198 194 230 194C262 194 286 216 286 252C286 286 262 310 230 310C198 310 174 286 174 252Z"
            fill="#FFF9F2"
            stroke="#26211D"
            strokeWidth="2.5"
          />

          {/* Friendly eyes and cheeks */}
          <circle cx="204" cy="192" r="6" fill="#26211D" />
          <circle cx="256" cy="192" r="6" fill="#26211D" />
          <circle cx="202" cy="190" r="2" fill="#FFF9F2" />
          <circle cx="254" cy="190" r="2" fill="#FFF9F2" />
          <ellipse cx="187" cy="204" rx="10" ry="6" fill="#F6B3C2" />
          <ellipse cx="273" cy="204" rx="10" ry="6" fill="#F6B3C2" />
          <path
            d="M217 205C221 212 239 212 243 205"
            stroke="#26211D"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Little sunlit crown sprout */}
          <path
            d="M230 132C230 112 242 98 258 94"
            stroke="#26211D"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M258 94C276 88 286 98 280 114C274 128 256 126 248 112"
            fill="#2C875C"
            stroke="#26211D"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Arms holding a gentle heart-leaf */}
          <path
            d="M150 236C128 242 126 266 150 272"
            stroke="#26211D"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M310 236C334 238 338 264 312 272"
            stroke="#26211D"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Gentle green heart emblem on chest */}
          <path
            d="M230 274C228.5 274 209 260 209 246.5C209 239.2 214.5 234 221.2 234C225.4 234 228.4 236.2 230 239C231.6 236.2 234.6 234 238.8 234C245.5 234 251 239.2 251 246.5C251 260 231.5 274 230 274Z"
            fill="#2C875C"
            stroke="#26211D"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M230 247V259M224 253H236"
            stroke="#FFF9F2"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        </g>

        {/* Warm floating speech note top-left */}
        <g>
          <rect
            x="38"
            y="148"
            width="114"
            height="46"
            rx="23"
            fill="#FFFCF8"
            stroke="#26211D"
            strokeWidth="2.5"
          />
          <circle cx="62" cy="171" r="9" fill="#F9CC59" />
          <path
            d="M80 167H130M80 177H116"
            stroke="#26211D"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>

        {/* Warm reassurance tag bottom-right */}
        <g>
          <rect
            x="294"
            y="214"
            width="126"
            height="50"
            rx="25"
            fill="#FFFCF8"
            stroke="#26211D"
            strokeWidth="2.5"
          />
          <circle cx="320" cy="239" r="10" fill="#DFF4E8" stroke="#2C875C" strokeWidth="2" />
          <path
            d="M316 239L319 242L325 235"
            stroke="#2C875C"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M340 234H398M340 245H382"
            stroke="#26211D"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      </motion.svg>
    </div>
  )
}
