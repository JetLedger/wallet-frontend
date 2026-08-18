import { colorFor, DEFAULT_CATEGORY } from './categoryColors'

interface Props {
  category: string | null
}

export function CategoryBadge({ category }: Props) {
  const label = category ?? DEFAULT_CATEGORY
  return (
    <span
      className="category-badge"
      style={{ backgroundColor: colorFor(label) }}
    >
      {label}
    </span>
  )
}