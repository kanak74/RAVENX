/**
 * Verified Nearby Healthcare Facilities API (/api/facilities)
 * Queries OpenStreetMap (Nominatim + multi-mirror Overpass API with Nominatim POI fallback)
 * for real hospitals, clinics, doctors, and pharmacies.
 */

interface OverpassElement {
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

interface FacilityResult {
  id: string
  name: string
  type: string
  address: string
  phone: string | null
  openingHours: string | null
  emergency: boolean
  distanceKm: number
  lat: number
  lon: number
  mapsUrl: string
  osmUrl: string
}

const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 7000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function queryOverpass(lat: number, lon: number): Promise<OverpassElement[] | null> {
  const overpassQuery = `
    [out:json][timeout:10];
    (
      node["amenity"~"hospital|clinic|doctors|pharmacy"](around:5000,${lat},${lon});
      way["amenity"~"hospital|clinic|doctors|pharmacy"](around:5000,${lat},${lon});
    );
    out center 25;
  `

  for (const mirror of OVERPASS_MIRRORS) {
    try {
      const res = await fetchWithTimeout(
        mirror,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'VITALORA-Health-Platform/1.0',
          },
          body: `data=${encodeURIComponent(overpassQuery)}`,
        },
        7000,
      )
      if (!res.ok) continue
      const data = (await res.json()) as { elements?: OverpassElement[] }
      if (Array.isArray(data.elements)) {
        return data.elements
      }
    } catch {
      // Try next mirror
    }
  }
  return null
}

async function queryNominatimFallback(
  lat: number,
  lon: number,
): Promise<FacilityResult[]> {
  const delta = 0.06
  const viewbox = `${lon - delta},${lat + delta},${lon + delta},${lat - delta}`
  const results: FacilityResult[] = []

  for (const term of ['hospital', 'clinic']) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&extratags=1&limit=8&bounded=1&viewbox=${viewbox}&q=${term}`
      const res = await fetchWithTimeout(
        url,
        { headers: { 'User-Agent': 'VITALORA-Health-Platform/1.0' } },
        6000,
      )
      if (!res.ok) continue
      const items = (await res.json()) as {
        place_id: number
        lat: string
        lon: string
        display_name: string
        name?: string
        type?: string
        extratags?: Record<string, string>
      }[]
      for (const item of items) {
        const elLat = Number(item.lat)
        const elLon = Number(item.lon)
        if (!Number.isFinite(elLat) || !Number.isFinite(elLon)) continue
        const name = item.name || item.display_name.split(',')[0]
        if (!name) continue
        results.push({
          id: `nom-${item.place_id}`,
          name,
          type: item.type || term,
          address: item.display_name,
          phone: item.extratags?.phone || item.extratags?.['contact:phone'] || null,
          openingHours: item.extratags?.opening_hours || null,
          emergency: item.extratags?.emergency === 'yes',
          distanceKm: haversineKm(lat, lon, elLat, elLon),
          lat: elLat,
          lon: elLon,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${elLat},${elLon}`,
          osmUrl: `https://www.openstreetmap.org/?mlat=${elLat}&mlon=${elLon}#map=16/${elLat}/${elLon}`,
        })
      }
    } catch {
      // Ignore partial failure
    }
  }

  return results
}

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url)
    const latParam = url.searchParams.get('lat')
    const lonParam = url.searchParams.get('lon')
    const query = url.searchParams.get('query')?.trim()

    let lat = latParam ? Number(latParam) : NaN
    let lon = lonParam ? Number(lonParam) : NaN
    let resolvedArea = ''

    if ((!Number.isFinite(lat) || !Number.isFinite(lon)) && query) {
      if (query.length < 2) {
        return jsonResponse(
          { error: 'Please enter a valid city, area, or pincode.' },
          400,
        )
      }
      const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
        query,
      )}`
      const nomRes = await fetchWithTimeout(
        nomUrl,
        { headers: { 'User-Agent': 'VITALORA-Health-Platform/1.0' } },
        7000,
      )
      if (!nomRes.ok) {
        return jsonResponse({ error: 'Location lookup failed. Please try again.' }, 502)
      }
      const nomData = (await nomRes.json()) as {
        lat: string
        lon: string
        display_name: string
      }[]
      if (!nomData.length) {
        return jsonResponse(
          { error: `No location matched "${query}". Try a nearby city or pincode.` },
          404,
        )
      }
      lat = Number(nomData[0].lat)
      lon = Number(nomData[0].lon)
      resolvedArea = nomData[0].display_name
    }

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return jsonResponse(
        { error: 'Provide valid coordinates or a city/pincode search.' },
        400,
      )
    }

    const elements = await queryOverpass(lat, lon)
    let facilities: FacilityResult[] = []

    if (elements !== null) {
      facilities = elements
        .map((el): FacilityResult | null => {
          const elLat = el.lat ?? el.center?.lat
          const elLon = el.lon ?? el.center?.lon
          const tags = el.tags ?? {}
          if (!elLat || !elLon || !tags.name) return null

          const addressParts = [
            tags['addr:housenumber'],
            tags['addr:street'],
            tags['addr:suburb'],
            tags['addr:city'],
            tags['addr:postcode'],
          ].filter(Boolean)

          return {
            id: String(el.id),
            name: tags.name,
            type: tags.amenity || 'clinic',
            address: addressParts.join(', ') || 'See map for exact street address',
            phone: tags.phone || tags['contact:phone'] || null,
            openingHours: tags.opening_hours || null,
            emergency: tags.emergency === 'yes',
            distanceKm: haversineKm(lat, lon, elLat, elLon),
            lat: elLat,
            lon: elLon,
            mapsUrl: `https://www.google.com/maps/search/?api=1&query=${elLat},${elLon}`,
            osmUrl: `https://www.openstreetmap.org/?mlat=${elLat}&mlon=${elLon}#map=16/${elLat}/${elLon}`,
          }
        })
        .filter((item): item is FacilityResult => Boolean(item))
    } else {
      // Fallback to Nominatim POI search if all Overpass mirrors are congested
      facilities = await queryNominatimFallback(lat, lon)
    }

    // Deduplicate by name + sort by distance
    const seen = new Set<string>()
    const uniqueSorted = facilities
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .filter((f) => {
        const key = f.name.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .slice(0, 12)

    return jsonResponse({
      center: { lat, lon },
      resolvedArea: resolvedArea || 'Your current location',
      source: 'OpenStreetMap (verified public registry)',
      facilities: uniqueSorted,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return jsonResponse({ error: msg }, 500)
  }
}
