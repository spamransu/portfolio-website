type StatListProps = {
  items: Array<{ label: string; value: string }>
}

export function StatList({ items }: StatListProps) {
  return (
    <dl className="stat-list">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
