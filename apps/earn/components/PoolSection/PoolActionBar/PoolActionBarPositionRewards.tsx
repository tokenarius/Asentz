import { formatUSD } from '@sushiswap/format'
import { Button, Currency, Dialog, Typography } from '@sushiswap/ui'
import { Checker } from '@sushiswap/wagmi'
import { FC, useCallback } from 'react'

import { PairWithAlias } from '../../../types'
import { usePoolPositionRewards } from '../../PoolPositionRewardsProvider'

interface PoolActionBarPositionRewardsProps {
  pair: PairWithAlias
  open: boolean
  setOpen(open: boolean): void
}

export const PoolActionBarPositionRewards: FC<PoolActionBarPositionRewardsProps> = ({ pair, open, setOpen }) => {
  const { pendingRewards, values, rewardTokens, isError, isLoading, error, harvest } = usePoolPositionRewards()
  const handleClose = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  return (
    <Dialog onClose={handleClose} open={open}>
      <Dialog.Content className="!pb-6">
        <Dialog.Header title="My Rewards" onClose={handleClose} />
        <div className="flex items-center justify-between p-2 pt-4 pb-3">
          <Typography weight={600} className="text-slate-50">
            My Rewards
          </Typography>
          <div className="flex flex-col">
            <Typography variant="sm" weight={600} className="text-right text-slate-50">
              {formatUSD(values.reduce((sum, value) => sum + value, 0))}
            </Typography>
          </div>
        </div>
        <div className="flex flex-col gap-3 px-2 py-4">
          {pendingRewards?.map((reward, index) => {
            if (!reward && isLoading && !isError)
              return (
                <div className="grid justify-between grid-cols-10 gap-2" key={index}>
                  <div className="h-[20px] bg-slate-700 animate-pulse col-span-8 rounded-full" />
                  <div className="h-[20px] bg-slate-700 animate-pulse col-span-2 rounded-full" />
                </div>
              )

            return (
              <div className="flex items-center justify-between" key={index}>
                <div className="flex items-center gap-2">
                  <Currency.Icon currency={rewardTokens[index]} width={20} height={20} />
                  <Typography variant="sm" weight={600} className="text-slate-300">
                    {reward?.toSignificant(6)} {rewardTokens[index].symbol}
                  </Typography>
                </div>
                <Typography variant="xs" weight={500} className="text-slate-400">
                  {formatUSD(values[index])}
                </Typography>
              </div>
            )
          })}
        </div>
        <div className="px-2 mt-3">
          <Checker.Connected fullWidth size="md">
            <Checker.Network fullWidth size="md" chainId={pair.chainId}>
              <Button size="md" fullWidth onClick={harvest}>
                Claim
              </Button>
            </Checker.Network>
          </Checker.Connected>
          {error && (
            <Typography variant="xs" className="mt-2 text-center text-red" weight={500}>
              {error}
            </Typography>
          )}
        </div>
      </Dialog.Content>
    </Dialog>
  )
}
