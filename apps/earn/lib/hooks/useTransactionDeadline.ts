import { chainsL2 } from '@sushiswap/chain'
import { useCurrentBlockTimestamp } from '@sushiswap/wagmi'
import { useMemo } from 'react'

import { L2_DEADLINE_FROM_NOW } from '../constants'
import { useSettings } from '../state/storage'

export const useTransactionDeadline = (chainId: number) => {
  const { data: blockTimestamp } = useCurrentBlockTimestamp(chainId)
  const [{ transactionDeadline: ttl }] = useSettings()

  return useMemo(() => {
    if (blockTimestamp && chainId && Object.keys(chainsL2).includes(chainId.toString())) {
      return blockTimestamp.add(L2_DEADLINE_FROM_NOW)
    }

    if (blockTimestamp && ttl) return blockTimestamp.add(ttl * 60)
    return undefined
  }, [blockTimestamp, chainId, ttl])
}
