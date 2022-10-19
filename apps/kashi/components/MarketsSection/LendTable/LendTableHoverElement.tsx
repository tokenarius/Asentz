import { formatPercent } from '@sushiswap/format'
import { Currency, Link, NetworkIcon, Typography } from '@sushiswap/ui'
import React, { FC } from 'react'
import useSWR from 'swr'

import { KashiPair } from '../../../.graphclient'
import { useTokensFromKashiPair } from '../../../lib/hooks'

interface LendTableHoverElementProps {
  row: KashiPair
}

export const LendTableHoverElement: FC<LendTableHoverElementProps> = ({ row }) => {
  const { asset } = useTokensFromKashiPair(row)
  const { data: pairs } = useSWR<KashiPair[]>(
    `/kashi/api/pairs?symbol=${(row.asset.symbol as string).toLowerCase()}&asset=true`,
    (url) => fetch(url).then((response) => response.json())
  )

  return (
    <div className="rounded-md overflow-hidden p-3">
      <div className="flex gap-3 items-center">
        <div className="w-6 h-6">
          <Currency.Icon currency={asset} width={24} height={24} />
        </div>
        <Typography weight={600} variant="xl">
          Lend {row.asset.symbol}
        </Typography>
      </div>
      <div className="h-px bg-slate-200/5 w-full my-3" />
      <div className="grid grid-cols-3 gap-2 mb-2">
        <Typography variant="sm" weight={500} className="text-slate-100">
          Network
        </Typography>
        <Typography variant="sm" weight={500} className="text-slate-100">
          Market Collateral
        </Typography>
        <Typography variant="sm" weight={500} className="text-slate-100 text-right">
          APR
        </Typography>
      </div>
      <div className="flex flex-col gap-2">
        {pairs
          ? pairs.map((pair) => (
              <Link.Internal passHref={true} key={pair.id} href={`/${pair.id}`}>
                <a className="grid grid-cols-3 gap-2 cursor-pointer hover:opacity-80">
                  <NetworkIcon chainId={pair.chainId} width={20} height={20} />
                  <Typography variant="sm" weight={400} className="text-slate-300">
                    {pair.collateral.symbol}
                  </Typography>
                  <Typography variant="sm" weight={400} className="text-slate-100 text-right">
                    {formatPercent(row.supplyAPR / 1e18)}
                  </Typography>
                </a>
              </Link.Internal>
            ))
          : Array.from(Array(3)).map((el, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-2 cursor-pointer hover:opacity-80">
                <div className="w-5 h-5 rounded-full animate-pulse bg-slate-700" />
                <div className="h-4 w-full rounded-full animate-pulse bg-slate-700" />
                <div className="h-4 w-full rounded-full animate-pulse bg-slate-700" />
              </div>
            ))}
      </div>
    </div>
  )
}
