import { ChainId } from '@sushiswap/chain'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'

import { getBuiltGraphSDK } from '.graphclient'

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59')
  const sdk = getBuiltGraphSDK()
  const { crossChainBentoBoxKpis: data } = await sdk.CrossChainBentoBoxKpis({
    chainIds: [
      ChainId.ETHEREUM,
      ChainId.POLYGON,
      ChainId.AVALANCHE,
      ChainId.BSC,
      ChainId.FANTOM,
      ChainId.GNOSIS,
      ChainId.ARBITRUM,
      ChainId.CELO,
      ChainId.MOONRIVER,
      ChainId.MOONBEAM,
      ChainId.OPTIMISM,
      ChainId.HARMONY,
      // ChainId.KAVA,
    ],
  })
  return {
    props: {
      data,
    },
  }
}

export default function IndexPage({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div className="grid grid-cols-6 gap-4 p-8">
      {data.map((kpi) => (
        <pre key={kpi.chainId} className="p-4 bg-slate-700 rounded-3xl">
          {JSON.stringify(kpi, null, 2)}
        </pre>
      ))}
    </div>
  )
}
