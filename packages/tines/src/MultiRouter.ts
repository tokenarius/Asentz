import { BigNumber } from '@ethersproject/bignumber'

import { Graph, MultiRoute, NetworkInfo, RouteStatus } from './Graph'
import { RPool, RToken, setTokenId } from './PrimaryPools'

// Assumes route is a single path
function calcPriceImactWithoutFee(route: MultiRoute) {
  if (route.primaryPrice === undefined || route.swapPrice === undefined) {
    return undefined
  } else {
    let oneMinusCombinedFee = 1
    route.legs.forEach((l) => (oneMinusCombinedFee *= 1 - l.poolFee))
    //const combinedFee = 1-oneMinusCombinedFee
    return Math.max(0, 1 - route.swapPrice / route.primaryPrice / oneMinusCombinedFee)
  }
}

const defaultFlowNumber = 12
const maxFlowNumber = 100
function calcBestFlowNumber(bestSingleRoute: MultiRoute, amountIn: BigNumber | number, gasPriceIn?: number): number {
  if (amountIn instanceof BigNumber) {
    amountIn = parseInt(amountIn.toString())
  }

  const priceImpact = calcPriceImactWithoutFee(bestSingleRoute)
  if (!priceImpact) return defaultFlowNumber

  const bestFlowAmount = Math.sqrt((bestSingleRoute.gasSpent * (gasPriceIn || 0) * amountIn) / priceImpact)
  const bestFlowNumber = Math.round(amountIn / bestFlowAmount)
  if (!isFinite(bestFlowNumber)) return maxFlowNumber

  const realFlowNumber = Math.max(1, Math.min(bestFlowNumber, maxFlowNumber))
  return realFlowNumber
}

function getBetterRouteExactIn(route1: MultiRoute, route2: MultiRoute): MultiRoute {
  if (route1.status == RouteStatus.NoWay) return route2
  if (route2.status == RouteStatus.NoWay) return route1
  if (route1.status == RouteStatus.Partial && route2.status == RouteStatus.Success) return route2
  if (route2.status == RouteStatus.Partial && route1.status == RouteStatus.Success) return route1
  return route1.totalAmountOut > route2.totalAmountOut ? route1 : route2
}

export function findMultiRouteExactIn(
  from: RToken,
  to: RToken,
  amountIn: BigNumber | number,
  pools: RPool[],
  baseTokenOrNetworks: RToken | NetworkInfo[],
  gasPrice?: number,
  flows?: number | number[]
): MultiRoute {
  checkChainId(pools, baseTokenOrNetworks)
  setTokenId(from, to)
  const g = new Graph(pools, from, baseTokenOrNetworks, gasPrice)

  if (flows !== undefined) return g.findBestRouteExactIn(from, to, amountIn, flows)

  const outSingle = g.findBestRouteExactIn(from, to, amountIn, 1)
  // Possible optimization of timing
  // if (g.findBestPathExactIn(from, to, amountIn/100 + 10_000, 0)?.gasSpent === 0) return outSingle
  g.cleanTmpData()

  const bestFlowNumber = calcBestFlowNumber(outSingle, amountIn, g.getVert(from)?.gasPrice)
  if (bestFlowNumber === 1) return outSingle

  const outMulti = g.findBestRouteExactIn(from, to, amountIn, bestFlowNumber)
  return getBetterRouteExactIn(outSingle, outMulti)
}

function getBetterRouteExactOut(route1: MultiRoute, route2: MultiRoute, gasPrice: number): MultiRoute {
  if (route1.status == RouteStatus.NoWay) return route2
  if (route2.status == RouteStatus.NoWay) return route1
  if (route1.status == RouteStatus.Partial && route2.status == RouteStatus.Success) return route2
  if (route2.status == RouteStatus.Partial && route1.status == RouteStatus.Success) return route1
  const totalAmountIn1 = route1.amountIn + route1.gasSpent * gasPrice
  const totalAmountIn2 = route2.amountIn + route2.gasSpent * gasPrice
  return totalAmountIn1 < totalAmountIn2 ? route1 : route2
}

export function findMultiRouteExactOut(
  from: RToken,
  to: RToken,
  amountOut: BigNumber | number,
  pools: RPool[],
  baseTokenOrNetworks: RToken | NetworkInfo[],
  gasPrice?: number,
  flows?: number | number[]
): MultiRoute {
  checkChainId(pools, baseTokenOrNetworks)
  setTokenId(from, to)
  if (amountOut instanceof BigNumber) {
    amountOut = parseInt(amountOut.toString())
  }

  const g = new Graph(pools, from, baseTokenOrNetworks, gasPrice)

  if (flows !== undefined) return g.findBestRouteExactOut(from, to, amountOut, flows)

  const inSingle = g.findBestRouteExactOut(from, to, amountOut, 1)
  // Possible optimization of timing
  // if (g.findBestPathExactOut(from, to, amountOut/100 + 10_000, 0)?.gasSpent === 0) return inSingle
  g.cleanTmpData()

  const fromV = g.getVert(from)
  const bestFlowNumber = calcBestFlowNumber(inSingle, inSingle.amountIn, fromV?.gasPrice)
  if (bestFlowNumber === 1) return inSingle

  const inMulti = g.findBestRouteExactOut(from, to, amountOut, bestFlowNumber)
  return getBetterRouteExactOut(inSingle, inMulti, fromV?.gasPrice || 0)
}

export function findSingleRouteExactIn(
  from: RToken,
  to: RToken,
  amountIn: BigNumber | number,
  pools: RPool[],
  baseTokenOrNetworks: RToken | NetworkInfo[],
  gasPrice?: number
): MultiRoute {
  checkChainId(pools, baseTokenOrNetworks)
  setTokenId(from, to)
  const g = new Graph(pools, from, baseTokenOrNetworks, gasPrice)

  const out = g.findBestRouteExactIn(from, to, amountIn, 1)
  return out
}

export function findSingleRouteExactOut(
  from: RToken,
  to: RToken,
  amountOut: BigNumber | number,
  pools: RPool[],
  baseTokenOrNetworks: RToken | NetworkInfo[],
  gasPrice?: number
): MultiRoute {
  checkChainId(pools, baseTokenOrNetworks)
  setTokenId(from, to)
  const g = new Graph(pools, from, baseTokenOrNetworks, gasPrice)

  if (amountOut instanceof BigNumber) {
    amountOut = parseInt(amountOut.toString())
  }

  const out = g.findBestRouteExactOut(from, to, amountOut, 1)
  return out
}

export function calcTokenPrices(pools: RPool[], baseToken: RToken): Map<RToken, number> {
  setTokenId(baseToken)
  const g = new Graph(pools, baseToken, baseToken, 0)
  const res = new Map<RToken, number>()
  g.vertices.forEach((v) => res.set(v.token, v.price))
  return res
}

// Checks correctness of ChainId of each token in each network
// Could be avoided for speed of work, but helps to find out difficult to catch bugs
function checkChainId(pools: RPool[], baseTokenOrNetworks: RToken | NetworkInfo[]) {
  if (baseTokenOrNetworks instanceof Array) {
    baseTokenOrNetworks.forEach((n) => {
      if (n.chainId !== n.baseToken.chainId) {
        throw new Error(`Chain '${n.chainId}' has baseToken with '${n.baseToken.chainId}' that are not the same`)
      }
    })
  }

  const chainIds: (string | number | undefined)[] =
    baseTokenOrNetworks instanceof Array ? baseTokenOrNetworks.map((n) => n.chainId) : [baseTokenOrNetworks.chainId]
  const chainIdSet = new Set(chainIds)

  const checkToken = (t: RToken) => {
    if (!chainIdSet.has(t.chainId)) {
      throw new Error(
        `Token ${t.name}/${t.address} chainId='${t.chainId}' is not in list of possible chains: [${chainIds.join(
          ', '
        )}]`
      )
    }
  }

  pools.forEach((p) => {
    checkToken(p.token0)
    checkToken(p.token1)
  })
}
