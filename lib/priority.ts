interface ClaimData {
  lossPercentage: number
  affectedArea: number
  isVerified: boolean
  hasReceivedRelief: boolean
}

export function calculatePriorityScore(data: ClaimData): number {
  let score = 0

  if (data.lossPercentage >= 75) score += 25
  else if (data.lossPercentage >= 50) score += 15
  else if (data.lossPercentage >= 25) score += 8

  if (data.affectedArea >= 5) score += 20
  else if (data.affectedArea >= 2) score += 12
  else if (data.affectedArea >= 1) score += 6

  if (data.isVerified) score += 10
  if (!data.hasReceivedRelief) score += 15

  return score
}