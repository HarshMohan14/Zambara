export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateRequired(value: any, fieldName: string): string | null {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    return `${fieldName} is required`
  }
  return null
}

export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string
): string | null {
  if (value.length < min) {
    return `${fieldName} must be at least ${min} characters`
  }
  if (value.length > max) {
    return `${fieldName} must be at most ${max} characters`
  }
  return null
}

export function validateNumber(
  value: any,
  min?: number,
  max?: number,
  fieldName: string = 'Value'
): string | null {
  const num = Number(value)
  if (isNaN(num)) {
    return `${fieldName} must be a number`
  }
  if (min !== undefined && num < min) {
    return `${fieldName} must be at least ${min}`
  }
  if (max !== undefined && num > max) {
    return `${fieldName} must be at most ${max}`
  }
  return null
}
