import { formatPercent } from '@sushiswap/format'
import { Typography } from '@sushiswap/ui'
import { FC } from 'react'

import { FarmRewardsAvailableTooltip } from '../FarmRewardsAvailableTooltip'
import { CellProps } from './types'

export const PairAPRCell: FC<CellProps> = ({ row }) => {
  return (
    <Typography variant="sm" weight={600} className="flex items-center gap-1 text-slate-50 justify-end">
      {!!row.farm && <FarmRewardsAvailableTooltip />}
      {formatPercent(row.apr)}
    </Typography>
  )
}
