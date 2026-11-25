/**
 * Verified Nearby Healthcare Facilities API (/api/facilities)
 * Queries OpenStreetMap (Nominatim + Overpass API) for real hospitals, clinics, and pharmacies.
 */

interface OverpassElement {
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

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
      const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
        query,
      )}`
      const nomRes = await fetch(nomUrl, {
        headers: { 'User-Agent': 'VITALORA-Health-Platform/1.0' },
      })
      if (!nomRes.ok) {
        return jsonResponse({ error: 'Location lookup failed.' }, 502)
      }
      const nomData = (await nomRes.json()) as {
        lat: string
        lon: string
        display_name: string
      }[]
      if (!nomData.length) {
        return jsonResponse({ error: 'Location not found. Try a city or pincode.' }, 404)
      }
      lat = Number(nomData[0].lat)
      lon = Number(nomData[0].lon)
      resolvedArea = nomData[0].display_name
    }

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return jsonResponse(
        { error: 'Provide either lat/lon coordinates or a location query.' },
        400,
      )
    }

    const overpassQuery = `
      [out:json][timeout:12];
      (
        node["amenity"~"hospital|clinic|doctors|pharmacy"](around:6000,${lat},${lon});
        way["amenity"~"hospital|clinic|doctors|pharmacy"](around:6000,${lat},${lon});
      );
      out center 25;
    `

    const ovRes = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'VITALORA-Health-Platform/1.0',
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
    })

    if (!ovRes.ok) {
      return jsonResponse(
        { error: 'Nearby facility service is temporarily busy. Please try again.' },
        502,
      )
    }

    const ovData = (await ovRes.json()) as { elements?: OverpassElement[] }
    const elements = ovData.elements ?? []

    const facilities = elements
      .map((el) => {
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
          address: addressParts.join(', ') || 'Address listed on OpenStreetMap',
          phone: tags.phone || tags['contact:phone'] || null,
          emergency: tags.emergency === 'yes',
          distanceKm: haversineKm(lat, lon, elLat, elLon),
          lat: elLat,
          lon: elLon,
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${elLat},${elLon}`,
        }
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 12)

    return jsonResponse({
      center: { lat, lon },
      resolvedArea: resolvedArea || 'Your current location',
      source: 'OpenStreetMap (verified public registry)',
      facilities,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return jsonResponse({ error: msg }, 500)
  }
}
