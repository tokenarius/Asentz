import { ChainId } from '@sushiswap/chain'
import { tryParseAmount } from '@sushiswap/currency'
import { FundSource } from '@sushiswap/hooks'
import { ZERO } from '@sushiswap/math'
import { STARGATE_BRIDGE_TOKENS } from '@sushiswap/stargate'
import { Button } from '@sushiswap/ui'
import { Widget } from '@sushiswap/ui/widget'
import { Checker } from '@sushiswap/wagmi'
import {
  BridgeExecuteProvider,
  BridgeReviewModal,
  BridgeStateProvider,
  CurrencyInputWithNetworkSelector,
  Layout,
  SettingsOverlay,
  SwapStatsDisclosure,
  SwitchCurrenciesButton,
  useBridgeState,
  useBridgeStateActions,
} from 'components'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { FC, useCallback, useEffect, useMemo } from 'react'

import { useBridgeOutput } from '../lib/hooks'
import { useCustomTokens } from '../lib/state/storage'

export const getServerSideProps: GetServerSideProps = async ({ query, res }) => {
  res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=59')
  const { srcToken, dstToken, srcChainId, dstChainId, srcTypedAmount } = query
  return {
    props: {
      srcToken: srcToken ?? null,
      dstToken: dstToken ?? null,
      srcChainId: srcChainId ?? ChainId.ETHEREUM,
      dstChainId: dstChainId ?? ChainId.ARBITRUM,
      srcTypedAmount: !isNaN(Number(srcTypedAmount)) ? srcTypedAmount : '',
    },
  }
}

export default function Bridge({
  srcChainId,
  dstChainId,
  srcToken,
  dstToken,
  srcTypedAmount,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const srcTokens = useMemo(() => STARGATE_BRIDGE_TOKENS[srcChainId], [srcChainId])
  const dstTokens = useMemo(() => STARGATE_BRIDGE_TOKENS[dstChainId], [dstChainId])
  return (
    <Layout>
      <Head>
        <title>Bridge | Sushi</title>
        <meta property="og:title" content="Bridge | Sushi" key="title" />
      </Head>
      <BridgeStateProvider
        initialState={{
          srcChainId: Number(srcChainId),
          dstChainId: Number(dstChainId),
          srcToken: srcTokens.includes(srcToken) ? srcTokens[srcTokens.indexOf(srcToken)] : srcTokens[0],
          dstToken: dstTokens.includes(dstToken) ? dstTokens[dstTokens.indexOf(dstToken)] : dstTokens[0],
          srcTypedAmount: !isNaN(Number(srcTypedAmount)) ? srcTypedAmount : '',
          dstTypedAmount: '',
          amount: !isNaN(Number(srcTypedAmount)) ? tryParseAmount(srcTypedAmount, srcToken) : undefined,
        }}
      >
        <BridgeExecuteProvider>
          <_Bridge />
        </BridgeExecuteProvider>
      </BridgeStateProvider>
    </Layout>
  )
}

const STARGATE_TOKEN_MAP = Object.fromEntries(
  Object.entries(STARGATE_BRIDGE_TOKENS).map(([chainId, tokens]) => [
    chainId,
    Object.fromEntries(tokens.map((token) => [token.address, token])),
  ])
)

const _Bridge: FC = () => {
  const router = useRouter()
  const { amount, srcChainId, dstChainId, srcToken, dstToken, srcTypedAmount, dstTypedAmount } = useBridgeState()
  const { setSrcChainId, setDstChainId, setSrcToken, setDstToken, setSrcTypedAmount, setDstTypedAmount } =
    useBridgeStateActions()

  const [srcCustomTokenMap, { addCustomToken: onAddSrcCustomToken, removeCustomToken: onRemoveSrcCustomToken }] =
    useCustomTokens(srcChainId)
  const [dstCustomTokenMap, { addCustomToken: onAddDstCustomToken, removeCustomToken: onRemoveDstCustomToken }] =
    useCustomTokens(dstChainId)

  const srcTokens = useMemo(() => STARGATE_TOKEN_MAP[srcChainId], [srcChainId])
  const dstTokens = useMemo(() => STARGATE_TOKEN_MAP[dstChainId], [dstChainId])

  const { dstAmountOut } = useBridgeOutput()
  useEffect(() => setDstTypedAmount(dstAmountOut?.toExact() ?? ''), [dstAmountOut, setDstTypedAmount])

  // This effect is responsible for encoding the swap state into the URL, to add statefullness
  // to the swapper. It has an escape hatch to prevent uneeded re-runs, this is important.
  // useEffect(() => {
  //   // Escape hatch if already synced (could probably pull something like this out to generic...)

  //   // console.debug([
  //   //   srcChainId === Number(router.query.srcChainId),
  //   //   dstChainId === Number(router.query.dstChainId),
  //   //   srcToken.symbol === router.query.srcToken || srcToken.wrapped.address === router.query.srcToken,
  //   //   dstToken.symbol === router.query.dstToken || dstToken.wrapped.address === router.query.dstToken,
  //   //   srcTypedAmount === router.query.srcTypedAmount,
  //   // ])

  //   if (
  //     srcChainId === Number(router.query.srcChainId) &&
  //     dstChainId === Number(router.query.dstChainId) &&
  //     (srcToken.symbol === router.query.srcToken || srcToken.wrapped.address === router.query.srcToken) &&
  //     (dstToken.symbol === router.query.dstToken || dstToken.wrapped.address === router.query.dstToken) &&
  //     srcTypedAmount === router.query.srcTypedAmount
  //   ) {
  //     return
  //   }

  //   void router.replace({
  //     pathname: router.pathname,
  //     query: {
  //       ...router.query,
  //       srcChainId,
  //       srcToken: srcToken && srcToken.isToken ? srcToken.address : srcToken.symbol,
  //       srcTypedAmount,
  //       dstChainId,
  //       dstToken: dstToken && dstToken.isToken ? dstToken.address : dstToken.symbol,
  //     },
  //   })
  // }, [srcToken, dstToken, srcChainId, dstChainId, router, srcTypedAmount])

  const inputAmounts = useMemo(() => {
    return [tryParseAmount(srcTypedAmount, srcToken)]
  }, [srcToken, srcTypedAmount])

  const switchCurrencies = useCallback(() => {
    const _srcChainId = srcChainId
    const _srcToken = srcToken
    const _dstChainId = dstChainId
    const _dstToken = dstToken

    setSrcChainId(_dstChainId)
    setSrcToken(_dstToken)
    setDstChainId(_srcChainId)
    setDstToken(_srcToken)
  }, [dstChainId, dstToken, setDstChainId, setDstToken, setSrcChainId, setSrcToken, srcChainId, srcToken])

  const onSrcNetworkSelect = useCallback(
    (chainId: number) => {
      setSrcChainId(chainId)
      setSrcToken(STARGATE_BRIDGE_TOKENS[chainId][0])
    },
    [setSrcChainId, setSrcToken]
  )

  const onDstNetworkSelect = useCallback(
    (chainId: number) => {
      setDstChainId(chainId)
      setDstToken(STARGATE_BRIDGE_TOKENS[chainId][0])
    },
    [setDstChainId, setDstToken]
  )

  return (
    <Widget id="bridge" maxWidth={400}>
      <Widget.Content>
        <Widget.Header title="Bridge">
          <div className="flex justify-end">
            <SettingsOverlay />
          </div>
        </Widget.Header>
        <CurrencyInputWithNetworkSelector
          className="p-3"
          onNetworkSelect={onSrcNetworkSelect}
          value={srcTypedAmount}
          onChange={setSrcTypedAmount}
          onSelect={setSrcToken}
          currency={srcToken}
          chainId={srcChainId}
          tokenMap={srcTokens}
          customTokenMap={srcCustomTokenMap}
          onAddToken={onAddSrcCustomToken}
          onRemoveToken={onRemoveSrcCustomToken}
        />
        <div className="flex items-center justify-center -mt-[12px] -mb-[12px] z-10">
          <SwitchCurrenciesButton onClick={switchCurrencies} />
        </div>
        <div className="bg-slate-800">
          <CurrencyInputWithNetworkSelector
            className="p-3"
            disabled
            disableMaxButton
            onNetworkSelect={onDstNetworkSelect}
            value={dstTypedAmount}
            onChange={setDstTypedAmount}
            onSelect={setDstToken}
            currency={dstToken}
            chainId={dstChainId}
            tokenMap={dstTokens}
            customTokenMap={dstCustomTokenMap}
            onAddToken={onAddDstCustomToken}
            onRemoveToken={onRemoveDstCustomToken}
            loading={amount?.greaterThan(ZERO) && !dstTypedAmount}
          />
          <SwapStatsDisclosure />
          <div className="p-3 pt-0">
            <Checker.Connected fullWidth size="md">
              <Checker.Amounts
                fullWidth
                size="md"
                chainId={srcChainId}
                fundSource={FundSource.WALLET}
                amounts={inputAmounts}
              >
                <Checker.Network fullWidth size="md" chainId={srcChainId}>
                  <BridgeReviewModal>
                    {({ isWritePending, setOpen }) => {
                      return (
                        <Button fullWidth size="md" onClick={() => setOpen(true)}>
                          Bridge
                        </Button>
                      )
                    }}
                  </BridgeReviewModal>
                </Checker.Network>
              </Checker.Amounts>
            </Checker.Connected>
          </div>
        </div>
      </Widget.Content>
    </Widget>
  )
}
