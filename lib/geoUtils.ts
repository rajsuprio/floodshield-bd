export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function getLandRiskLevel(
  landLat: number,
  landLon: number,
  zones: { latitude: number; longitude: number; radius: number; riskLevel: string }[]
): string | null {
  for (const zone of zones) {
    const dist = getDistanceKm(landLat, landLon, zone.latitude, zone.longitude)
    if (dist <= zone.radius) return zone.riskLevel
  }
  return null
}
