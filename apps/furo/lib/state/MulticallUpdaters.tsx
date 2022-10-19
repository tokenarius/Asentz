import { ChainId } from '@sushiswap/chain'

import { Updater } from './MulticallUpdater'

interface Props {
  chainIds: ChainId[]
  isDebug?: boolean
}

export function Updaters({ chainIds, isDebug = true }: Props) {
  return (
    <>
      {chainIds.map((chainId) => (
        <Updater key={chainId} chainId={chainId} isDebug={isDebug} />
      ))}
    </>
  )
}
