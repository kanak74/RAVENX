export type OrganicBlobVariant = 'coral' | 'butter' | 'pink' | 'green'

export interface OrganicBlobProps {
  variant?: OrganicBlobVariant
  className?: string
}

const BLOB_COLORS: Record<OrganicBlobVariant, string> = {
  coral: '#FFE5DD',
  butter: '#FFF3CC',
  pink: '#FDE9EE',
  green: '#DFF4E8',
}

/** Soft decorative organic silhouette used behind hero and section visuals. */
export function OrganicBlob({
  variant = 'butter',
  className = '',
}: OrganicBlobProps) {
  return (
    <svg
      viewBox="0 0 400 360"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M322.5 54.4C364.2 91.6 385.8 153.2 373.9 211.7C362 270.2 316.6 325.6 257.9 343.2C199.2 360.8 127.2 340.6 76.5 297.2C25.8 253.8 -3.6 187.2 10.6 128.4C24.8 69.6 82.6 18.6 146.5 7.1C210.4 -4.4 280.8 17.2 322.5 54.4Z"
        fill={BLOB_COLORS[variant]}
      />
    </svg>
  )
}

export interface WaveDividerProps {
  fill: string
  flip?: boolean
  className?: string
}

/** Gentle curved transition between warm background bands. */
export function WaveDivider({
  fill,
  flip = false,
  className = '',
}: WaveDividerProps) {
  return (
    <div
      className={`w-full overflow-hidden leading-none ${flip ? 'rotate-180' : ''} ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 72"
        preserveAspectRatio="none"
        className="block h-10 w-full sm:h-14"
      >
        <path
          d="M0,48 C240,8 480,8 720,40 C960,72 1200,72 1440,32 L1440,72 L0,72 Z"
          fill={fill}
        />
      </svg>
    </div>
  )
}
