import { formatUSD } from '@sushiswap/format'
import { Currency, Typography } from '@sushiswap/ui'
import React, { FC } from 'react'

import { usePoolPosition } from '../../PoolPositionProvider'

export const AddSectionMyPositionUnstaked: FC = () => {
  const { balance, value0, value1, underlying1, underlying0, isError, isLoading } = usePoolPosition()

  if (isLoading && !isError && !balance) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex gap-1 justify-between items-center">
          <Typography variant="sm" weight={600} className="text-slate-50">
            My Liquidity Position
          </Typography>
          <div className="h-[16px] w-[40px] animate-pulse bg-slate-600 rounded-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center gap-1.5">
            <div className="h-[16px] w-[120px] bg-slate-700 animate-pulse rounded-full" />
            <div className="h-[16px] w-[40px] bg-slate-700 animate-pulse rounded-full" />
          </div>
          <div className="flex justify-between items-center gap-1.5">
            <div className="h-[16px] w-[120px] bg-slate-700 animate-pulse rounded-full" />
            <div className="h-[16px] w-[40px] bg-slate-700 animate-pulse rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 justify-between items-center">
        <Typography variant="sm" weight={600} className="text-slate-50">
          My Liquidity Position
        </Typography>
        <Typography variant="xs" weight={500} className="text-slate-400">
          {formatUSD(value0 + value1)}
        </Typography>
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4">
            {underlying0 && <Currency.Icon currency={underlying0.currency} width={16} height={16} />}
          </div>
          <Typography variant="xs" weight={500} className="flex items-center gap-1 text-slate-400">
            {balance && underlying0?.toSignificant(3)} {underlying0?.currency.symbol}
          </Typography>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4">
            {underlying1 && <Currency.Icon currency={underlying1.currency} width={16} height={16} />}
          </div>
          <Typography variant="xs" weight={500} className="flex items-center gap-1 text-slate-400">
            {balance && underlying1?.toSignificant(3)} {underlying1?.currency.symbol}
          </Typography>
        </div>
      </div>
    </div>
  )
}
