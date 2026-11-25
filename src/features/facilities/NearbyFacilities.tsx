import { useState, type FormEvent } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

interface FacilityItem {
  id: string
  name: string
  type: string
  address: string
  phone: string | null
  emergency: boolean
  distanceKm: number
  mapsUrl: string
}

export function NearbyFacilities() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [areaLabel, setAreaLabel] = useState('')
  const [facilities, setFacilities] = useState<FacilityItem[]>([])

  const fetchByCoords = async (lat: number, lon: number) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/facilities?lat=${lat}&lon=${lon}`)
      const data = (await res.json()) as {
        facilities?: FacilityItem[]
        resolvedArea?: string
        error?: string
      }
      if (!res.ok) {
        setError(data.error ?? 'Could not load nearby facilities.')
        return
      }
      setFacilities(data.facilities ?? [])
      setAreaLabel(data.resolvedArea ?? 'Your location')
    } catch {
      setError('Unable to reach nearby healthcare facility service.')
    } finally {
      setLoading(false)
    }
  }

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setError('Location access is not supported by your browser. Search by city or pincode instead.')
      return
    }
    setLoading(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void fetchByCoords(pos.coords.latitude, pos.coords.longitude)
      },
      () => {
        setLoading(false)
        setError('Location permission denied. Enter a city or pincode below instead.')
      },
    )
  }

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(
        `/api/facilities?query=${encodeURIComponent(query.trim())}`,
      )
      const data = (await res.json()) as {
        facilities?: FacilityItem[]
        resolvedArea?: string
        error?: string
      }
      if (!res.ok) {
        setError(data.error ?? 'No facilities found for that location.')
        return
      }
      setFacilities(data.facilities ?? [])
      setAreaLabel(data.resolvedArea ?? query.trim())
    } catch {
      setError('Unable to reach nearby healthcare facility service.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      aria-labelledby="nearby-facilities-heading"
      className="rounded-2xl border border-hairline bg-paper p-5 sm:p-6 space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Badge tone="coral" dotColor="#C25941">
            Nearby Care
          </Badge>
          <h2
            id="nearby-facilities-heading"
            className="mt-1.5 font-display text-xl font-semibold text-charcoal"
          >
            Find verified nearby hospitals &amp; clinics
          </h2>
          <p className="text-xs text-stone">
            Live public healthcare listings from OpenStreetMap within 6 km.
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

      <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Or enter city, neighborhood, or pincode (e.g. Bengaluru 560001)..."
          className="flex-1 rounded-xl border border-hairline-strong bg-ivory px-4 py-2.5 text-sm text-charcoal placeholder:text-stone focus:border-forest focus:outline-none"
        />
        <Button type="submit" variant="forest" size="md" disabled={loading || !query.trim()}>
          {loading ? 'Searching...' : 'Find clinics'}
        </Button>
      </form>

      {error ? (
        <p role="alert" className="text-xs font-medium text-urgent">
          {error}
        </p>
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
                  {f.phone ? (
                    <p className="mt-1 text-xs font-medium text-charcoal">
                      Tel: {f.phone}
                    </p>
                  ) : null}
                </div>
                <a
                  href={f.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-xs font-semibold text-forest hover:underline"
                >
                  Open in Google Maps →
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
