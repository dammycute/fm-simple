import type { ReactNode } from 'react'

interface Column<T> {
  header: string
  accessor: (row: T) => ReactNode
  hideOnMobile?: boolean
  align?: 'left' | 'center' | 'right'
}

interface CardTableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey: (row: T) => string
  cardTitle: (row: T) => string
  cardSubtitle?: (row: T) => string
  cardMeta?: (row: T) => { label: string; value: ReactNode; color?: string }[]
  emptyMessage?: string
}

export function CardTable<T>({
  columns,
  data,
  rowKey,
  cardTitle,
  cardSubtitle,
  cardMeta,
  emptyMessage = 'No data',
}: CardTableProps<T>) {
  if (data.length === 0) {
    return <p className="text-text-secondary text-sm py-4">{emptyMessage}</p>
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-text-secondary border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.header}
                  className={`py-2 px-2 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={rowKey(row)} className="border-b border-border/50 text-text-primary">
                {columns.map((col) => (
                  <td
                    key={col.header}
                    className={`py-1.5 px-2 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                  >
                    {col.accessor(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {data.map((row) => (
          <div key={rowKey(row)} className="bg-bg-surface border border-border rounded p-3">
            <div className="flex justify-between items-start mb-1">
              <div>
                <p className="font-medium text-text-primary text-sm">{cardTitle(row)}</p>
                {cardSubtitle && <p className="text-text-secondary text-xs">{cardSubtitle(row)}</p>}
              </div>
              {cardMeta && cardMeta.length > 0 && (
                <div className="text-right">
                  {cardMeta(row).map((m, i) => (
                    <p key={i} className={`text-xs font-semibold ${m.color ?? 'text-text-primary'}`}>{m.label}: {m.value}</p>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
              {columns
                .filter((c) => !c.hideOnMobile)
                .map((col) => (
                  <div key={col.header} className="text-xs">
                    <span className="text-text-secondary">{col.header}: </span>
                    <span className="text-text-primary">{col.accessor(row)}</span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
