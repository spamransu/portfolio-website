import sty from './StatList.module.scss'

type StatListProps = {
  items: Array<{ label: string; value: string }>
}

export function StatList({ items }: StatListProps) {
  return (
    <dl className={sty.root}>
      {items.map((item) => (
        <div className={sty.item} key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
