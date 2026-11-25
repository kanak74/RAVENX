import { motion } from 'framer-motion'

/** Full illustrated scene for Step 1: "Tell us how you're feeling." */
export function StoryStepIllustration({ step }: { step: 1 | 2 | 3 }) {
  if (step === 1) {
    return (
      <svg
        viewBox="0 0 320 220"
        fill="none"
        role="img"
        aria-label="Friendly illustration of symptom bubbles in warm coral, butter yellow, and soft pink"
        className="mx-auto h-auto w-full max-w-[300px]"
      >
        <path
          d="M276 46C305 74 313 122 293 159C273 196 226 216 172 213C118 210 58 184 34 142C10 100 22 42 64 21C106 0 247 18 276 46Z"
          fill="#FFE5DD"
        />
        <circle cx="62" cy="54" r="14" fill="#F9CC59" />
        <circle cx="268" cy="164" r="11" fill="#F6B3C2" />

        {/* Friendly main chat card */}
        <rect
          x="52"
          y="46"
          width="196"
          height="118"
          rx="28"
          fill="#FFFCF8"
          stroke="#26211D"
          strokeWidth="3"
        />
        <circle cx="88" cy="82" r="16" fill="#FF7B61" stroke="#26211D" strokeWidth="2.5" />
        <path
          d="M88 90C87.3 90 80 85.4 80 80.5C80 78 81.9 76.2 84.2 76.2C85.7 76.2 87 77 88 78.2C89 77 90.3 76.2 91.8 76.2C94.1 76.2 96 78 96 80.5C96 85.4 88.7 90 88 90Z"
          fill="#FFF9F2"
        />
        <path d="M116 77H216M116 90H186" stroke="#26211D" strokeWidth="3.5" strokeLinecap="round" />

        {/* Tap-friendly symptom chips */}
        <rect x="72" y="114" width="76" height="30" rx="15" fill="#FFF3CC" stroke="#26211D" strokeWidth="2.2" />
        <circle cx="88" cy="129" r="5" fill="#FF7B61" />
        <path d="M99 129H134" stroke="#26211D" strokeWidth="2.8" strokeLinecap="round" />

        <rect x="158" y="114" width="68" height="30" rx="15" fill="#DFF4E8" stroke="#26211D" strokeWidth="2.2" />
        <path d="M174 129H210" stroke="#26211D" strokeWidth="2.8" strokeLinecap="round" />

        {/* Warm cozy thermometer badge */}
        <g transform="translate(216 118)">
          <rect x="0" y="0" width="52" height="58" rx="18" fill="#F9CC59" stroke="#26211D" strokeWidth="2.5" />
          <path d="M26 14V34" stroke="#26211D" strokeWidth="5" strokeLinecap="round" />
          <path d="M26 22V34" stroke="#DE4436" strokeWidth="3" strokeLinecap="round" />
          <circle cx="26" cy="39" r="7" fill="#DE4436" stroke="#26211D" strokeWidth="2.2" />
        </g>
      </svg>
    )
  }

  if (step === 2) {
    return (
      <svg
        viewBox="0 0 320 220"
        fill="none"
        role="img"
        aria-label="Friendly illustration of simple one-at-a-time questions with clear yes and no buttons"
        className="mx-auto h-auto w-full max-w-[300px]"
      >
        <path
          d="M270 36C308 66 312 126 286 168C260 210 202 216 142 209C82 202 22 182 14 134C6 86 50 22 108 10C166 -2 232 6 270 36Z"
          fill="#FFF3CC"
        />
        <circle cx="52" cy="164" r="14" fill="#FFE5DD" />
        <circle cx="272" cy="52" r="10" fill="#2C875C" />

        {/* Main question card */}
        <rect
          x="58"
          y="38"
          width="204"
          height="138"
          rx="28"
          fill="#FFFCF8"
          stroke="#26211D"
          strokeWidth="3"
        />
        <circle cx="94" cy="74" r="15" fill="#F9CC59" stroke="#26211D" strokeWidth="2.5" />
        <text
          x="94"
          y="80"
          textAnchor="middle"
          fill="#26211D"
          fontSize="18"
          fontWeight="800"
          fontFamily="Fraunces, Georgia, serif"
        >
          ?
        </text>
        <path d="M120 69H232M120 82H200" stroke="#26211D" strokeWidth="3.5" strokeLinecap="round" />

        {/* Friendly choice pills */}
        <rect x="78" y="108" width="76" height="40" rx="20" fill="#DFF4E8" stroke="#2C875C" strokeWidth="2.5" />
        <path d="M96 128L102 134L114 121" stroke="#2C875C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M122 128H140" stroke="#26211D" strokeWidth="3" strokeLinecap="round" />

        <rect x="164" y="108" width="78" height="40" rx="20" fill="#FDE9EE" stroke="#26211D" strokeWidth="2.5" />
        <circle cx="184" cy="128" r="5" fill="#FF7B61" />
        <path d="M196 128H226" stroke="#26211D" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 320 220"
      fill="none"
      role="img"
      aria-label="Friendly illustration of calm next steps, rest tips, and when to see a doctor"
      className="mx-auto h-auto w-full max-w-[300px]"
    >
      <path
        d="M278 52C308 86 308 144 276 178C244 212 180 218 122 208C64 198 16 170 18 124C20 78 72 20 132 10C192 0 248 18 278 52Z"
        fill="#DFF4E8"
      />
      <circle cx="52" cy="54" r="12" fill="#F9CC59" />
      <circle cx="272" cy="166" r="12" fill="#F6B3C2" />

      {/* Guidance sheet */}
      <rect
        x="56"
        y="38"
        width="196"
        height="142"
        rx="28"
        fill="#FFFCF8"
        stroke="#26211D"
        strokeWidth="3"
      />

      {/* Green calm care row */}
      <circle cx="88" cy="76" r="13" fill="#2C875C" />
      <path d="M83 76L86.5 79.5L94 72" stroke="#FFF9F2" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M112 72H220M112 82H184" stroke="#26211D" strokeWidth="3.2" strokeLinecap="round" />

      {/* Butter yellow tip row */}
      <circle cx="88" cy="114" r="13" fill="#F9CC59" stroke="#26211D" strokeWidth="2" />
      <circle cx="88" cy="114" r="4" fill="#26211D" />
      <path d="M112 110H214M112 120H174" stroke="#26211D" strokeWidth="3.2" strokeLinecap="round" />

      {/* Tomato red doctor alert row */}
      <circle cx="88" cy="150" r="13" fill="#DE4436" />
      <path d="M88 144V151M88 155H88.01" stroke="#FFF9F2" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M112 146H212M112 156H188" stroke="#26211D" strokeWidth="3.2" strokeLinecap="round" />

      {/* Warm mug accent */}
      <g transform="translate(226 112)">
        <rect x="4" y="14" width="38" height="32" rx="10" fill="#FF7B61" stroke="#26211D" strokeWidth="2.5" />
        <path d="M42 22H48C51 22 53 24.5 53 28C53 31.5 51 34 48 34H42" stroke="#26211D" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M16 4C16 7 18 8 18 10M28 4C28 7 30 8 30 10" stroke="#26211D" strokeWidth="2.2" strokeLinecap="round" />
      </g>
    </svg>
  )
}

/** Editorial illustration for the Health Awareness section. */
export function BodyAwarenessIllustration() {
  return (
    <motion.svg
      viewBox="0 0 380 310"
      fill="none"
      role="img"
      aria-label="Illustration of a calm person listening to gentle body signals surrounded by warm leaves and sunbeams"
      className="mx-auto h-auto w-full max-w-[380px]"
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45 }}
    >
      {/* Organic backdrop */}
      <path
        d="M322 52C362 94 374 162 346 216C318 270 250 302 184 298C118 294 54 254 28 198C2 142 14 70 60 32C106 -6 282 10 322 52Z"
        fill="#FFF3CC"
      />
      <path
        d="M286 98C314 132 316 186 288 224C260 262 202 276 154 260C106 244 68 198 70 150C72 102 114 52 166 48C218 44 258 64 286 98Z"
        fill="#FDE9EE"
      />

      {/* Calm ripple rings */}
      <circle cx="190" cy="166" r="78" stroke="#F6B3C2" strokeWidth="3" strokeDasharray="8 8" />
      <circle cx="190" cy="166" r="54" stroke="#FF7B61" strokeWidth="2.5" strokeOpacity="0.45" />

      {/* Friendly resting sun-person character */}
      <ellipse cx="190" cy="248" rx="68" ry="12" fill="#EADCCF" />
      <path
        d="M142 186C142 144 162 116 190 116C218 116 238 144 238 186C238 224 218 242 190 242C162 242 142 224 142 186Z"
        fill="#2C875C"
        stroke="#26211D"
        strokeWidth="3"
      />
      {/* Friendly face */}
      <circle cx="190" cy="100" r="34" fill="#FFE5DD" stroke="#26211D" strokeWidth="3" />
      <path d="M174 97C176 94 180 94 182 97" stroke="#26211D" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M198 97C200 94 204 94 206 97" stroke="#26211D" strokeWidth="2.6" strokeLinecap="round" />
      <ellipse cx="170" cy="105" rx="6" ry="3.5" fill="#F6B3C2" />
      <ellipse cx="210" cy="105" rx="6" ry="3.5" fill="#F6B3C2" />
      <path d="M182 108C185 113 195 113 198 108" stroke="#26211D" strokeWidth="2.6" strokeLinecap="round" />

      {/* Heart pulse emblem */}
      <circle cx="190" cy="176" r="24" fill="#FFF9F2" stroke="#26211D" strokeWidth="2.5" />
      <path
        d="M190 187C189 187 177 179.4 177 171.6C177 167.5 180.2 164.5 184.1 164.5C186.5 164.5 188.6 165.8 190 167.7C191.4 165.8 193.5 164.5 195.9 164.5C199.8 164.5 203 167.5 203 171.6C203 179.4 191 187 190 187Z"
        fill="#FF7B61"
      />

      {/* Warm leaves and sun cues */}
      <g transform="translate(52 88)">
        <rect x="0" y="0" width="90" height="36" rx="18" fill="#FFFCF8" stroke="#26211D" strokeWidth="2.5" />
        <circle cx="20" cy="18" r="7" fill="#F9CC59" />
        <path d="M34 18H72" stroke="#26211D" strokeWidth="3" strokeLinecap="round" />
      </g>

      <g transform="translate(242 142)">
        <rect x="0" y="0" width="96" height="36" rx="18" fill="#FFFCF8" stroke="#26211D" strokeWidth="2.5" />
        <circle cx="20" cy="18" r="7" fill="#2C875C" />
        <path d="M34 18H78" stroke="#26211D" strokeWidth="3" strokeLinecap="round" />
      </g>
    </motion.svg>
  )
}

/** Cozy small illustration inside the "Check my symptoms" coming-soon preview dialog. */
export function SymptomCheckPreviewIllustration() {
  return (
    <svg
      viewBox="0 0 180 120"
      fill="none"
      aria-hidden="true"
      className="mx-auto h-28 w-auto"
    >
      <ellipse cx="90" cy="64" rx="74" ry="48" fill="#FFF3CC" />
      <circle cx="38" cy="40" r="12" fill="#FDE9EE" />
      <circle cx="148" cy="84" r="10" fill="#DFF4E8" />
      <rect
        x="48"
        y="22"
        width="84"
        height="76"
        rx="22"
        fill="#FFFCF8"
        stroke="#26211D"
        strokeWidth="2.8"
      />
      <circle cx="90" cy="52" r="16" fill="#FF7B61" stroke="#26211D" strokeWidth="2.4" />
      <path
        d="M90 60C89.3 60 82 55.4 82 50.4C82 47.8 84 46 86.3 46C87.8 46 89 46.8 90 48C91 46.8 92.2 46 93.7 46C96 46 98 47.8 98 50.4C98 55.4 90.7 60 90 60Z"
        fill="#FFF9F2"
      />
      <path d="M70 80H110" stroke="#26211D" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
