import { useState, type FormEvent } from 'react'
import { ShieldAlertIcon } from '../../components/illustrations/Icons'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

interface FacilityItem {
  id: string
  name: string
  type: string
  address: string
  phone: string | null
  openingHours: string | null
  emergency: boolean
  distanceKm: number
  mapsUrl: string
  osmUrl?: string
}

export interface NearbyFacilitiesProps {
  recommendedSpecialists?: string[]
}

export function NearbyFacilities({
  recommendedSpecialists = [],
}: NearbyFacilitiesProps = {}) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [areaLabel, setAreaLabel] = useState('')
  const [facilities, setFacilities] = useState<FacilityItem[]>([])
  const [lastRequest, setLastRequest] = useState<
    { type: 'coords'; lat: number; lon: number } | { type: 'query'; q: string } | null
  >(null)

  const fetchByCoords = async (lat: number, lon: number) => {
    setLoading(true)
    setError('')
    setHasSearched(true)
    setLastRequest({ type: 'coords', lat, lon })
    try {
      const res = await fetch(`/api/facilities?lat=${lat}&lon=${lon}`)
      const data = (await res.json()) as {
        facilities?: FacilityItem[]
        resolvedArea?: string
        error?: string
      }
      if (!res.ok) {
        setFacilities([])
        setError(data.error ?? 'Could not load nearby facilities.')
        return
      }
      setFacilities(data.facilities ?? [])
      setAreaLabel(data.resolvedArea ?? 'Your location')
    } catch {
      setFacilities([])
      setError('Unable to reach nearby healthcare facility service. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchByQuery = async (searchText: string) => {
    const trimmed = searchText.trim()
    if (trimmed.length < 2) {
      setError('Please enter a valid city, neighborhood, or pincode.')
      return
    }
    setLoading(true)
    setError('')
    setHasSearched(true)
    setLastRequest({ type: 'query', q: trimmed })
    try {
      const res = await fetch(
        `/api/facilities?query=${encodeURIComponent(trimmed)}`,
      )
      const data = (await res.json()) as {
        facilities?: FacilityItem[]
        resolvedArea?: string
        error?: string
      }
      if (!res.ok) {
        setFacilities([])
        setError(data.error ?? 'No facilities found for that location.')
        return
      }
      setFacilities(data.facilities ?? [])
      setAreaLabel(data.resolvedArea ?? trimmed)
    } catch {
      setFacilities([])
      setError('Unable to reach nearby healthcare facility service. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setError(
        'Location access is not supported by your browser. Search by city or pincode below instead.',
      )
      return
    }
    setLoading(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void fetchByCoords(pos.coords.latitude, pos.coords.longitude)
      },
      (geoErr) => {
        setLoading(false)
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          setError(
            'Location permission was denied. Enter a city or pincode below to search manually.',
          )
        } else if (geoErr.code === geoErr.TIMEOUT) {
          setError(
            'Location lookup timed out. Try again or enter a city/pincode below.',
          )
        } else {
          setError(
            'Your location is currently unavailable. Enter a city or pincode below instead.',
          )
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    )
  }

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
      aria-labelledby="nearby-facilities-heading"
      className="rounded-2xl border border-hairline bg-paper p-5 sm:p-6 space-y-4"
    >
      {/* Instant Emergency Notice — never blocked by location or API */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-urgent/25 bg-urgent-soft/50 px-4 py-3 text-xs text-charcoal">
        <div className="flex items-center gap-2">
          <ShieldAlertIcon className="h-4 w-4 shrink-0 text-urgent" />
          <span>
            <strong>Medical emergency?</strong> Do not wait for search results — call{' '}
            <strong>112</strong> right away.
          </span>
        </div>
        <a
          href="tel:112"
          className="inline-flex items-center rounded-lg bg-urgent px-3 py-1 font-semibold text-paper"
        >
          Call 112
        </a>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Badge tone="coral" dotColor="#0D9488">
            Step 6 · Doctor Consultation &amp; Nearby Care
          </Badge>
          <h2
            id="nearby-facilities-heading"
            className="mt-1.5 font-display text-xl font-semibold text-charcoal"
          >
            Find a doctor &amp; verified nearby medical facilities
          </h2>
          <p className="text-xs text-stone">
            Live public healthcare listings from OpenStreetMap within 5 km. We
            never display fake doctor profiles or simulated booking slots.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUseGps}
          disabled={loading}
        >
          Use my location
        </Button>
      </div>

      {/* Doctor Specialization & Consultation Guidance */}
      <div className="rounded-xl border border-forest/20 bg-peach-mist/70 p-4 space-y-1.5 text-xs text-charcoal">
        <p className="font-semibold text-forest">
          Consultation Preparation &amp; Specialization
        </p>
        {recommendedSpecialists.length > 0 ? (
          <p>
            <strong>Suggested specialist(s) to look for:</strong>{' '}
            {Array.from(new Set(recommendedSpecialists)).join(', ')}
          </p>
        ) : (
          <p>
            <strong>Suggested starting point:</strong> General Physician / Primary
            Care Clinic for initial examination and evaluation.
          </p>
        )}
        <p className="text-slate">
          Bring your symptom timeline, downloaded VITALORA PDF summary, and any
          medications or allergies when calling or visiting a clinic.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Or enter city, neighborhood, or pincode (e.g. Bengaluru 560001)..."
          className="flex-1 rounded-xl border border-hairline-strong bg-ivory px-4 py-2.5 text-sm text-charcoal placeholder:text-stone focus:border-forest focus:outline-none"
        />
        <Button type="submit" variant="forest" size="md" disabled={loading}>
          {loading ? 'Searching...' : 'Find clinics'}
        </Button>
      </form>

      {error ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-urgent/25 bg-urgent-soft/40 p-3 text-xs text-charcoal"
        >
          <span className="font-medium text-urgent">{error}</span>
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

      {!loading && !error && hasSearched && facilities.length === 0 ? (
        <div className="rounded-xl border border-hairline bg-ivory p-4 text-sm text-slate">
          No hospitals or clinics were found in OpenStreetMap near{' '}
          <strong>{areaLabel}</strong>. Try searching a broader city name or
          nearby neighborhood.
        </div>
      ) : null}

      {facilities.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-medium text-stone">
            Showing {facilities.length} facilities near {areaLabel}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {facilities.map((f) => (
              <div
                key={f.id}
                className="flex flex-col justify-between rounded-xl border border-hairline bg-ivory p-4 space-y-2"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-charcoal">
                      {f.name}
                    </h3>
                    <span className="shrink-0 text-xs font-semibold text-forest">
                      {f.distanceKm} km
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs capitalize text-stone">
                    {f.type}
                    {f.emergency ? ' · Emergency services' : ''}
                  </p>
                  <p className="mt-1 text-xs text-slate">{f.address}</p>
                  {f.openingHours ? (
                    <p className="mt-1 text-xs text-stone">
                      Hours: {f.openingHours}
                    </p>
                  ) : null}
                  {f.phone ? (
                    <p className="mt-1 text-xs font-medium text-charcoal">
                      Tel: {f.phone}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-3 pt-1">
                  <a
                    href={f.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex text-xs font-semibold text-forest hover:underline"
                  >
                    Directions (Google Maps) →
                  </a>
                  {f.osmUrl ? (
                    <a
                      href={f.osmUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex text-xs font-medium text-stone hover:underline"
                    >
                      View on OSM
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
