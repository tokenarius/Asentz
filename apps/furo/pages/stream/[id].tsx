import { Breadcrumb, ProgressBar, ProgressColor } from '@sushiswap/ui'
import { getFuroStreamContractConfig, useWalletState } from '@sushiswap/wagmi'
import {
  BackgroundVector,
  CancelModal,
  FuroTimer,
  HistoryPopover,
  Layout,
  Overlay,
  ProgressBarCard,
  StreamDetailsPopover,
  TransferModal,
  UpdateModal,
} from 'components'
import { BalanceChart, WithdrawModal } from 'components/stream'
import { getRebase, getStream, getStreamTransactions, Stream } from 'lib'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { FC, useMemo, useState } from 'react'
import useSWR, { SWRConfig } from 'swr'
import { useConnect } from 'wagmi'

import { ChartHover } from '../../types'
import type { Rebase as RebaseDTO, Stream as StreamDTO, Transaction as TransactionDTO } from '.graphclient'

interface Props {
  fallback?: {
    stream?: StreamDTO
    transactions?: TransactionDTO[]
  }
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ query: { chainId, id } }) => {
  const stream = (await getStream(chainId as string, id as string)) as StreamDTO
  const [transactions, rebases] = await Promise.all([
    getStreamTransactions(chainId as string, id as string),
    getRebase(chainId as string, stream.token.id),
  ])
  return {
    props: {
      fallback: {
        [`/furo/api/stream/${chainId}/${id}`]: stream as StreamDTO,
        [`/furo/api/stream/${chainId}/${id}/transactions`]: transactions as TransactionDTO[],
        [`/furo/api/rebase/${chainId}/${stream.token.id}`]: rebases as RebaseDTO,
      },
    },
  }
}

const Streams: FC<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ fallback }) => {
  return (
    <SWRConfig value={{ fallback }}>
      <_Streams />
    </SWRConfig>
  )
}

const LINKS = (id: string) => [
  {
    href: `/stream/${id}`,
    label: `Stream ${id}`,
  },
]

const _Streams: FC = () => {
  const router = useRouter()
  const chainId = Number(router.query.chainId as string)
  const id = Number(router.query.id as string)
  const connect = useConnect()
  const { connecting, reconnecting } = useWalletState(!!connect.pendingConnector)

  const { data: transactions } = useSWR<TransactionDTO[]>(`/furo/api/stream/${chainId}/${id}/transactions`, (url) =>
    fetch(url).then((response) => response.json())
  )

  const { data: furo } = useSWR<StreamDTO>(`/furo/api/stream/${chainId}/${id}`, (url) =>
    fetch(url).then((response) => response.json())
  )

  const { data: rebase } = useSWR<RebaseDTO>(
    () => (chainId && furo ? `/furo/api/rebase/${chainId}/${furo.token.id}` : null),
    (url) => fetch(url).then((response) => response.json())
  )

  const [hover, setHover] = useState<ChartHover>(ChartHover.NONE)

  const stream = useMemo(
    () => (chainId && furo && rebase ? new Stream({ chainId, furo, rebase }) : undefined),
    [chainId, furo, rebase]
  )

  if (connecting || reconnecting) return <Overlay />

  return (
    <>
      <NextSeo title={`Stream #${id}`} />
      <Layout
        backdrop={
          <div className="fixed inset-0 right-0 z-0 pointer-events-none opacity-20">
            <BackgroundVector width="100%" preserveAspectRatio="none" />
          </div>
        }
      >
        <Breadcrumb home="/dashboard" links={LINKS(router.query.id as string)} />
        <div className="flex flex-col md:grid md:grid-cols-[430px_280px] justify-center gap-8 lg:gap-x-16 md:gap-y-6 pt-6 md:pt-24">
          <div className="flex justify-center">
            <BalanceChart stream={stream} hover={hover} setHover={setHover} />
          </div>
          <div>
            <div className="flex flex-col justify-center gap-5">
              <ProgressBarCard
                aria-hidden="true"
                label="Streamed"
                value={`${stream?.streamedPercentage?.toSignificant(4)}%`}
                onMouseEnter={() => setHover(ChartHover.STREAMED)}
                onMouseLeave={() => setHover(ChartHover.NONE)}
              >
                <ProgressBar
                  progress={
                    stream && stream.streamedPercentage ? stream.streamedPercentage.divide(100).toSignificant(4) : 0
                  }
                  color={ProgressColor.BLUE}
                  showLabel={false}
                />
              </ProgressBarCard>
              <ProgressBarCard
                aria-hidden="true"
                label="Withdrawn"
                value={`${stream?.withdrawnPercentage?.toSignificant(4)}%`}
                onMouseEnter={() => setHover(ChartHover.WITHDRAW)}
                onMouseLeave={() => setHover(ChartHover.NONE)}
              >
                <ProgressBar
                  progress={stream ? stream.withdrawnPercentage.divide(100).toSignificant(4) : 0}
                  color={ProgressColor.PINK}
                  showLabel={false}
                />
              </ProgressBarCard>
              <div className="mt-3">
                <FuroTimer furo={stream} />
              </div>
            </div>
          </div>
          <div className="flex items-end justify-center gap-2">
            <StreamDetailsPopover stream={stream} />
            <HistoryPopover stream={stream} transactionRepresentations={transactions} />
          </div>
          <div className="flex flex-col gap-2">
            <WithdrawModal stream={stream} />
            <div className="flex gap-2">
              <TransferModal
                stream={stream}
                abi={getFuroStreamContractConfig(chainId)?.contractInterface}
                address={getFuroStreamContractConfig(chainId)?.addressOrName}
              />
              <UpdateModal
                stream={stream}
                abi={getFuroStreamContractConfig(chainId)?.contractInterface}
                address={getFuroStreamContractConfig(chainId)?.addressOrName}
              />
              <CancelModal
                title="Cancel Stream"
                stream={stream}
                abi={getFuroStreamContractConfig(chainId)?.contractInterface}
                address={getFuroStreamContractConfig(chainId)?.addressOrName}
                fn="cancelStream"
              />
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}

export default Streams
