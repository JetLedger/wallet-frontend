import { useMemo, useState } from 'react'
import * as d3 from 'd3'
import type { CategorySpendingDto } from '../api/types'
import { formatMoney } from './BalanceCard'
import { colorFor } from './categoryColors'

interface ArcDatum extends d3.PieArcDatum<CategorySpendingDto> {}

interface Props {
  data: CategorySpendingDto[]
  currency: string
}

export function SpendingDonut({ data, currency }: Props) {
  const [hovered, setHovered] = useState<CategorySpendingDto | null>(null)

  const total = useMemo(
    () => data.reduce((sum, c) => sum + c.amount, 0),
    [data],
  )

  const arcs = useMemo(() => {
    if (total <= 0 || data.length === 0) return []
    const pie = d3
      .pie<CategorySpendingDto>()
      .value((d) => d.amount)
      .sort(null)
    const arc = d3.arc<ArcDatum>().innerRadius(50).outerRadius(80)
    return pie(data).map((a) => ({ ...a, path: arc(a) ?? '' }))
  }, [data, total])

  const percent = (d: CategorySpendingDto): number =>
    total > 0 ? (d.amount / total) * 100 : 0

  return (
    <section className="spending-donut" aria-label="Spending by category">
      <h3 className="spending-donut__title">Spending this month</h3>

      {total <= 0 ? (
        <div className="spending-donut__empty">
          <div className="spending-donut__ring" aria-hidden="true" />
          <p className="spending-donut__hint">No spending yet this month</p>
        </div>
      ) : (
        <>
          <div className="spending-donut__chart">
            <svg
              className="spending-donut__svg"
              width={200}
              height={200}
              viewBox="-100 -100 200 200"
              role="img"
              aria-label="Donut chart of spending by category"
            >
              {arcs.map((a, i) => (
                <path
                  key={i}
                  d={a.path}
                  fill={colorFor(a.data.category)}
                  className="spending-donut__slice"
                  onMouseEnter={() => setHovered(a.data)}
                  onMouseLeave={() => setHovered(null)}
                />
              ))}
            </svg>
            {hovered && (
              <div className="spending-donut__tooltip" role="status">
                <span className="spending-donut__tooltip-category">
                  {hovered.category}
                </span>
                <span className="spending-donut__tooltip-amount">
                  {formatMoney(hovered.amount, currency)}
                </span>
                <span className="spending-donut__tooltip-pct">
                  {percent(hovered).toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          <ul className="spending-donut__legend">
            {data.map((d) => (
              <li key={d.category} className="spending-donut__legend-item">
                <span
                  className="spending-donut__legend-swatch"
                  style={{ backgroundColor: colorFor(d.category) }}
                />
                <span className="spending-donut__legend-name">
                  {d.category}
                </span>
                <span className="spending-donut__legend-value">
                  {formatMoney(d.amount, currency)} · {percent(d).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}