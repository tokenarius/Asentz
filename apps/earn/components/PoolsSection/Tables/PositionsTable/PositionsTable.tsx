import { UserWithFarm } from '@sushiswap/graph-client/.graphclient'
import { GenericTable, useBreakpoint } from '@sushiswap/ui'
import { getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table'
import React, { FC, useCallback, useEffect, useState } from 'react'
import useSWR from 'swr'
import { useAccount } from 'wagmi'

import { usePoolFilters } from '../../../PoolsFiltersProvider'
import { APR_COLUMN, NAME_COLUMN, NETWORK_COLUMN, VALUE_COLUMN } from './Cells/columns'
import { PositionQuickHoverTooltip } from './PositionQuickHoverTooltip'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const COLUMNS = [NETWORK_COLUMN, NAME_COLUMN, VALUE_COLUMN, APR_COLUMN]
// VOLUME_COLUMN

export const PositionsTable: FC = () => {
  const { selectedNetworks } = usePoolFilters()
  const { address } = useAccount()
  const { isSm } = useBreakpoint('sm')
  const { isMd } = useBreakpoint('md')

  const [sorting, setSorting] = useState<SortingState>([{ id: 'value', desc: true }])
  const [columnVisibility, setColumnVisibility] = useState({})

  const { data: userWithFarms, isValidating } = useSWR<UserWithFarm[]>(
    address
      ? `/earn/api/user/${address}${selectedNetworks ? `?networks=${JSON.stringify(selectedNetworks)}` : ''}`
      : null,
    (url) => fetch(url).then((response) => response.json())
  )

  const table = useReactTable<UserWithFarm>({
    data: userWithFarms || [],
    state: {
      sorting,
      columnVisibility,
    },
    columns: COLUMNS,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  useEffect(() => {
    if (isSm && !isMd) {
      setColumnVisibility({ volume: false, network: false })
    } else if (isSm) {
      setColumnVisibility({})
    } else {
      setColumnVisibility({ volume: false, network: false, apr: false, liquidityUSD: false })
    }
  }, [isMd, isSm])

  const rowLink = useCallback((row: UserWithFarm) => {
    return `/${row.id}`
  }, [])

  return (
    <GenericTable<UserWithFarm>
      table={table}
      HoverElement={isMd ? PositionQuickHoverTooltip : undefined}
      loading={!userWithFarms && isValidating}
      placeholder="No positions found"
      pageSize={Math.max(userWithFarms?.length || 0, 5)}
      linkFormatter={rowLink}
    />
  )
}
