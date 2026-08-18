export function isNewer(a: string, b: string): boolean {
  return Date.parse(a) > Date.parse(b)
}