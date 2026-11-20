export const dayBounds = (day?: string) => {
  const d = day && /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : new Date().toISOString().slice(0, 10)
  return { day: d, from: new Date(d + "T00:00:00.000Z"), to: new Date(d + "T23:59:59.999Z") }
}
export const METHODS = ["cash", "wave", "om", "card"] as const
