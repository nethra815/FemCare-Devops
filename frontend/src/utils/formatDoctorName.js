/**
 * Format doctor name with "Dr." prefix
 * Handles cases where name might already have "Dr." prefix
 */
export const formatDoctorName = (name) => {
  if (!name) return ""
  
  // Remove any existing "Dr." or "Dr " prefix (case insensitive)
  const cleanName = name.replace(/^(Dr\.?\s*)/i, "").trim()
  
  // Add "Dr." prefix
  return `Dr. ${cleanName}`
}

/**
 * Get doctor name without "Dr." prefix
 */
export const getDoctorNameOnly = (name) => {
  if (!name) return ""
  return name.replace(/^(Dr\.?\s*)/i, "").trim()
}
