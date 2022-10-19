import { formatNumber } from '@sushiswap/format'
import { useInViewport } from '@sushiswap/hooks'
import { classNames, Currency, NetworkIcon, Typography } from '@sushiswap/ui'
import { FC, useRef } from 'react'

import { useTokensFromPair } from '../../../../../lib/hooks'
import { ICON_SIZE } from '../../contants'
import { CellProps } from './types'

export const PairNameCell: FC<CellProps> = ({ row }) => {
  const { token0, token1 } = useTokensFromPair(row)
  const ref = useRef<HTMLDivElement>(null)
  const inViewport = useInViewport(ref)
  return (
    <div className="flex items-center gap-3 sm:gap-0">
      <div className="hidden sm:flex">
        <Currency.IconList iconWidth={ICON_SIZE} iconHeight={ICON_SIZE}>
          <Currency.Icon disableLink currency={token0} priority={inViewport} />
          <Currency.Icon disableLink currency={token1} priority={inViewport} />
        </Currency.IconList>
      </div>
      <div className="flex sm:hidden">
        <NetworkIcon chainId={row.chainId} width={ICON_SIZE} height={ICON_SIZE} />
      </div>
      <div className="flex flex-col">
        <Typography variant="sm" weight={500} className="flex items-center gap-1 text-slate-50">
          {token0.symbol} <span className="text-slate-500">/</span> {token1.symbol}{' '}
          <div className={classNames('bg-slate-700 rounded-lg px-1 py-0.5 ml-1')}>
            {formatNumber(row.swapFee / 100)}%
          </div>
        </Typography>
        <Typography variant="xxs" className="text-slate-400">
          {row.type === 'STABLE_POOL' && 'Stable'}
          {row.type === 'CONSTANT_PRODUCT_POOL' && 'Classic'}
        </Typography>
      </div>
    </div>
  )
}
