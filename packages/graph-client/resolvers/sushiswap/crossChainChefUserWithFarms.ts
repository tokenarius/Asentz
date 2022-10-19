import { ChainId } from '@sushiswap/chain'

import { getBuiltGraphSDK, QueryResolvers, UserWithFarm } from '../../.graphclient'
import { getTokenBalances } from '../../fetchers/token'

export const crossChainUserWithFarms: QueryResolvers['crossChainUserWithFarms'] = async (root, args) => {
  const sdk = getBuiltGraphSDK()

  // ugly but good for performance because of the pair fetch
  const [unstakedPools, stakedPools] = await Promise.all([
    sdk
      .CrossChainUser({ id: args.id, where: { balance_gt: 0 }, chainIds: args.chainIds, now: 0 })
      .then(async ({ crossChainUser: user }) => {
        const balances = await getTokenBalances(
          (user.liquidityPositions ?? []).map((lp) => ({
            token: lp.pair.id.split(':')[1],
            user: args.id,
            chainId: lp.pair.chainId,
          }))
        )

        return (user.liquidityPositions ?? [])
          .map((lp) => ({
            id: lp.pair.id,
            unstakedBalance: balances.find((el) => el.token === lp.pair.id.split(':')[1])?.balance ?? '0',
            stakedBalance: '0',
            pair: lp.pair,
            chainId: lp.pair.chainId,
            chainName: lp.pair.chainName,
          }))
          .filter((entry) => entry.unstakedBalance !== '0')
      }),

    sdk
      .CrossChainChefUser({ where: { address: args.id, amount_gt: 0 }, chainIds: args.chainIds })
      .then(async ({ crossChainChefUser }) => {
        // TODO?: move pair fetch to crossChainChefUser resolver
        const stakedPairs = (
          await Promise.all(
            crossChainChefUser.map(({ chainId, pool }) =>
              sdk
                .CrossChainPair({ id: (pool as { pair: string }).pair, chainId, now: 0 })
                .then(({ crossChainPair: pair }) => pair)
            )
          )
        ).filter((pair) => !(pair && pair.chainId === ChainId.POLYGON && pair.source === 'LEGACY'))
        // TODO: remove when polygon subgraph is synced

        return crossChainChefUser
          .map((user) => {
            const pair = stakedPairs.find((stakedPair) => stakedPair?.id?.split(':')[1] === user.pool?.pair)

            if (!pair) return

            return {
              id: pair.id,
              unstakedBalance: '0',
              stakedBalance: String(user.amount),
              pair: pair,
              chainId: user.chainId,
              chainName: user.chainName,
            }
          })
          .filter((user): user is NonNullable<typeof user> => !!user && !!user.pair.id)
      }),
  ])

  const allPairIds = Array.from(new Set([...unstakedPools, ...stakedPools].map((el) => el.id)))

  return allPairIds.reduce((acc, cur) => {
    const unstaked = unstakedPools.find((el) => el.id === cur)
    const staked = stakedPools.find((el) => el.id === cur)
    const combined = (staked
      ? unstaked
        ? { ...unstaked, stakedBalance: staked.stakedBalance }
        : staked
      : (unstaked as NonNullable<typeof unstaked>)) as unknown as UserWithFarm // pair type doesn't match, problem for a future somebody

    const pair = unstaked?.pair ?? (staked as NonNullable<typeof unstaked>).pair

    const totalBalance = Number(unstaked?.unstakedBalance ?? 0) + Number(staked?.stakedBalance ?? 0)
    const valueUSD = (totalBalance / pair.liquidity) * pair.liquidityUSD

    acc.push({ ...combined, valueUSD })
    return acc
  }, [] as UserWithFarm[])
}
