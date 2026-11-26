import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'

interface FacilityItem {
  id: string
  name: string
  type: string
  specialty?: string
  matchesSpecialist?: boolean
  address: string
  phone: string | null
  website?: string | null
  openingHours: string | null
  emergency: boolean
  distanceKm: number
  mapsUrl: string
  osmUrl?: string
}

export interface NearbyFacilitiesProps {
  recommendedSpecialist?: string
  recommendedSpecialists?: string[]
  locateTrigger?: number
}

export function NearbyFacilities({
  recommendedSpecialist,
  recommendedSpecialists = [],
  locateTrigger = 0,
}: NearbyFacilitiesProps = {}) {
  const activeSpecialist =
    recommendedSpecialist?.trim() || recommendedSpecialists[0]?.trim() || ''

  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState('')
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [areaLabel, setAreaLabel] = useState('')
  const [facilities, setFacilities] = useState<FacilityItem[]>([])
  const [lastRequest, setLastRequest] = useState<
    { type: 'coords'; lat: number; lon: number } | { type: 'query'; q: string } | null
  >(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const lastTriggerRef = useRef(0)

  const buildApiUrl = (params: Record<string, string>) => {
    const search = new URLSearchParams(params)
    if (activeSpecialist) {
      search.set('specialist', activeSpecialist)
    }
    return `/api/facilities?${search.toString()}`
  }

  const fetchByCoords = async (lat: number, lon: number) => {
    setLoading(true)
    setError('')
    setHasSearched(true)
    setLastRequest({ type: 'coords', lat, lon })
    try {
      const res = await fetch(
        buildApiUrl({ lat: String(lat), lon: String(lon) }),
      )
      const data = (await res.json()) as {
        facilities?: FacilityItem[]
        resolvedArea?: string
        error?: string
      }
      if (!res.ok) {
        setFacilities([])
        setError(data.error ?? 'Could not load nearby healthcare providers.')
        return
      }
      setFacilities(data.facilities ?? [])
      setAreaLabel(data.resolvedArea ?? 'your current location')
    } catch {
      setFacilities([])
      setError('Unable to reach the healthcare directory right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchByQuery = async (searchText: string) => {
    const trimmed = searchText.trim()
    if (trimmed.length < 2) {
      setError('Please enter a valid city, area, or PIN code.')
      return
    }
    setLoading(true)
    setError('')
    setHasSearched(true)
    setLastRequest({ type: 'query', q: trimmed })
    try {
      const res = await fetch(buildApiUrl({ query: trimmed }))
      const data = (await res.json()) as {
        facilities?: FacilityItem[]
        resolvedArea?: string
        error?: string
      }
      if (!res.ok) {
        setFacilities([])
        setError(data.error ?? 'No healthcare providers found for that location.')
        return
      }
      setFacilities(data.facilities ?? [])
      setAreaLabel(data.resolvedArea ?? trimmed)
    } catch {
      setFacilities([])
      setError('Unable to reach the healthcare directory right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setPermissionDenied(true)
      setError(
        'Location access is not supported by your browser. Please enter your city or PIN code below.',
      )
      inputRef.current?.focus()
      return
    }
    setLocating(true)
    setLoading(true)
    setError('')
    setPermissionDenied(false)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        void fetchByCoords(pos.coords.latitude, pos.coords.longitude)
      },
      (geoErr) => {
        setLocating(false)
        setLoading(false)
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          setPermissionDenied(true)
          setError(
            'Location permission was denied. Enter your city or PIN code below to find nearby doctors.',
          )
          setTimeout(() => inputRef.current?.focus(), 50)
        } else if (geoErr.code === geoErr.TIMEOUT) {
          setError(
            'Location request timed out. Please try again or enter your city or PIN code below.',
          )
        } else {
          setError(
            'Could not detect your location. Please enter your city or PIN code below.',
          )
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    )
  }

  useEffect(() => {
    if (locateTrigger > 0 && locateTrigger !== lastTriggerRef.current) {
      lastTriggerRef.current = locateTrigger
      handleUseGps()
    }
  }, [locateTrigger])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    void fetchByQuery(query)
  }

  const handleRetry = () => {
    if (!lastRequest) return
    if (lastRequest.type === 'coords') {
      void fetchByCoords(lastRequest.lat, lastRequest.lon)
    } else {
      void fetchByQuery(lastRequest.q)
    }
  }

  return (
    <section
      id="nearby-healthcare-providers"
      aria-labelledby="nearby-facilities-heading"
      className="rounded-2xl border border-hairline bg-paper p-5 sm:p-6 space-y-4 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-forest">
            Nearby Healthcare Providers
          </p>
          <h2
            id="nearby-facilities-heading"
            className="mt-1 font-display text-xl font-semibold text-charcoal"
          >
            {activeSpecialist
              ? `Find ${activeSpecialist} & Nearby Clinics`
              : 'Find Nearby Doctors & Hospitals'}
          </h2>
          <p className="mt-0.5 text-xs text-stone">
            Real clinics, doctors, and hospitals from OpenStreetMap — no fabricated profiles.
          </p>
        </div>

        <Button
          type="button"
          variant="forest"
          size="sm"
          onClick={handleUseGps}
          disabled={loading}
          className="shrink-0"
        >
          {locating
            ? 'Getting location...'
            : loading
              ? 'Searching...'
              : 'Use my location'}
        </Button>
      </div>

      {/* Manual city or PIN code fallback */}
      <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Or enter city or PIN code (e.g. Bengaluru, 560001)..."
          aria-label="Enter city or PIN code"
          className={`flex-1 rounded-xl border bg-ivory px-4 py-2.5 text-sm text-charcoal placeholder:text-stone focus:border-forest focus:outline-none ${
            permissionDenied ? 'border-coral' : 'border-hairline-strong'
          }`}
        />
        <Button type="submit" variant="outline" size="md" disabled={loading}>
          {loading && !locating ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {error ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-coral/35 bg-coral-soft/40 p-3 text-xs text-charcoal"
        >
          <span className="font-medium text-charcoal">{error}</span>
          {lastRequest ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={loading}
            >
              Retry
            </Button>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-32 animate-pulse rounded-xl border border-hairline bg-ivory p-4"
            />
          ))}
        </div>
      ) : null}

      {!loading && !error && hasSearched && facilities.length === 0 ? (
        <div className="rounded-xl border border-hairline bg-ivory p-4 text-sm text-slate">
          No doctors, clinics, or hospitals were found in OpenStreetMap near{' '}
          <strong>{areaLabel}</strong>. Try searching a broader city name or nearby PIN code.
        </div>
      ) : null}

      {!loading && facilities.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-medium text-stone">
            Showing {facilities.length} nearby providers near {areaLabel}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {facilities.map((f) => (
              <article
                key={f.id}
                className="flex flex-col justify-between rounded-xl border border-hairline bg-ivory p-4 space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-charcoal leading-snug">
                      {f.name}
                    </h3>
                    <span className="shrink-0 rounded-full bg-sage-mist px-2.5 py-0.5 text-xs font-semibold text-forest">
                      {f.distanceKm} km
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-medium text-forest">
                      {f.specialty || f.type}
                    </span>
                    {f.matchesSpecialist && activeSpecialist ? (
                      <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[11px] font-semibold text-forest">
                        Matches {activeSpecialist}
                      </span>
                    ) : null}
                    {f.emergency ? (
                      <span className="rounded-full bg-urgent-soft px-2 py-0.5 text-[11px] font-semibold text-urgent">
                        Emergency
                      </span>
                    ) : null}
                  </div>

                  <p className="text-xs text-slate leading-relaxed">{f.address}</p>

                  {f.phone ? (
                    <p className="text-xs font-medium text-charcoal">
                      Phone:{' '}
                      <a
                        href={`tel:${f.phone}`}
                        className="text-forest hover:underline"
                      >
                        {f.phone}
                      </a>
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-hairline/70">
                  <a
                    href={f.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg bg-forest px-3 py-1.5 text-xs font-semibold text-paper transition-opacity hover:opacity-90"
                  >
                    Google Maps Directions
                  </a>
                  {f.website ? (
                    <a
                      href={f.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-lg border border-hairline-strong bg-paper px-3 py-1.5 text-xs font-semibold text-charcoal hover:bg-sand"
                    >
                      Website
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
