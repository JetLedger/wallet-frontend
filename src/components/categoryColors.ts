export const CATEGORY_COLORS: Record<string, string> = {
  FOOD: '#f59e0b',
  TRANSPORT: '#3b82f6',
  SHOPPING: '#ec4899',
  BILLS: '#ef4444',
  ENTERTAINMENT: '#8b5cf6',
  HEALTH: '#10b981',
  TRAVEL: '#06b6d4',
  UNCATEGORIZED: '#6b7280',
}

export const DEFAULT_CATEGORY = 'UNCATEGORIZED'

export function colorFor(category: string): string {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS[DEFAULT_CATEGORY]
}