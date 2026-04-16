export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password) => {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  return passwordRegex.test(password)
}

export const validatePhone = (phone) => {
  if (!phone || typeof phone !== "string") return false
  const phoneRegex = /^[\d\s\-+()]{10,}$/
  return phoneRegex.test(phone)
}

export const validateAge = (age) => {
  return age >= 18 && age <= 120
}

export const validateHeight = (height) => {
  return height >= 100 && height <= 250
}

export const validateWeight = (weight) => {
  return weight >= 30 && weight <= 500
}
