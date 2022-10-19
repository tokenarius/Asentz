import { Amount, SUSHI, SUSHI_ADDRESS, Token } from '@sushiswap/currency'
import { ZERO } from '@sushiswap/math'
import { NotificationData } from '@sushiswap/ui'
import { useCallback, useMemo } from 'react'
import { erc20ABI, useAccount, useContractReads, useDeprecatedSendTransaction } from 'wagmi'
import { ReadContractsConfig } from 'wagmi/actions'

import {
  getMasterChefContractConfig,
  getMasterChefContractV2Config,
  useMasterChefContract,
} from './useMasterChefContract'

export enum Chef {
  MASTERCHEF,
  MASTERCHEF_V2,
  MINICHEF,
}

interface UseMasterChefReturn extends Pick<ReturnType<typeof useDeprecatedSendTransaction>, 'isLoading' | 'isError'> {
  deposit(amount: Amount<Token> | undefined): void
  withdraw(amount: Amount<Token> | undefined): void
  balance: Amount<Token> | undefined
  harvest(): void
  pendingSushi: Amount<Token> | undefined
  isWritePending: boolean
  isWriteError: boolean
}

interface UseMasterChefParams {
  chainId: number
  chef: Chef
  pid: number
  token: Token
  enabled?: boolean
  onSuccess?(data: NotificationData): void
  watch?: boolean
}

type UseMasterChef = (params: UseMasterChefParams) => UseMasterChefReturn

export const useMasterChef: UseMasterChef = ({
  chainId,
  watch = true,
  chef,
  pid,
  token,
  enabled = true,
  onSuccess,
}) => {
  const { address } = useAccount()
  const contract = useMasterChefContract(chainId, chef)
  const {
    sendTransactionAsync,
    isLoading: isWritePending,
    isError: isWriteError,
  } = useDeprecatedSendTransaction({ chainId })
  const config = useMemo(() => getMasterChefContractConfig(chainId, chef), [chainId, chef])
  const v2Config = useMemo(() => getMasterChefContractV2Config(chainId), [chainId])

  const contracts = useMemo(() => {
    const inputs: ReadContractsConfig['contracts'] = []

    if (!chainId) return []

    if (enabled && chainId in SUSHI_ADDRESS) {
      inputs.push({
        chainId,
        addressOrName: SUSHI_ADDRESS[chainId],
        contractInterface: erc20ABI,
        functionName: 'balanceOf',
        args: [config.addressOrName],
      })
    }

    if (enabled && !!address && config.addressOrName) {
      inputs.push({
        ...config,
        functionName: 'userInfo',
        args: [pid, address],
      })
    }

    if (enabled && !!address && !!v2Config.addressOrName) {
      inputs.push({
        ...v2Config,
        functionName: 'pendingSushi',
        args: [pid, address],
      })
    }

    return inputs
  }, [address, chainId, config, enabled, pid, v2Config])

  const { data, isLoading, isError } = useContractReads({
    contracts,
    watch,
    keepPreviousData: true,
    enabled: contracts.length > 0 && enabled,
  })

  const [sushiBalance, balance, pendingSushi] = useMemo(() => {
    const copy = data ? [...data] : []
    const _sushiBalance = Boolean(chainId && SUSHI_ADDRESS[chainId]) && enabled ? copy.shift() : undefined
    const _balance = !!address && enabled && config.addressOrName ? copy.shift()?.amount : undefined
    const _pendingSushi = enabled && !!v2Config.addressOrName ? copy.shift() : undefined

    const balance = Amount.fromRawAmount(token, _balance ? _balance.toString() : 0)
    const pendingSushi = SUSHI[chainId]
      ? Amount.fromRawAmount(SUSHI[chainId], _pendingSushi ? _pendingSushi.toString() : 0)
      : undefined
    const sushiBalance = SUSHI[chainId]
      ? Amount.fromRawAmount(SUSHI[chainId], _sushiBalance ? _sushiBalance.toString() : 0)
      : undefined
    return [sushiBalance, balance, pendingSushi]
  }, [address, chainId, config.addressOrName, data, enabled, token, v2Config.addressOrName])

  /**
   * @throws {Error}
   */
  const deposit = useCallback(
    async (amount: Amount<Token> | undefined) => {
      if (!chainId) return console.error('useMasterChef: chainId not defined')
      if (!amount) return console.error('useMasterChef: amount not defined')
      if (!contract) return console.error('useMasterChef: contract not defined')

      const data = await sendTransactionAsync({
        request: {
          from: address,
          to: contract.address,
          data: contract.interface.encodeFunctionData(
            'deposit',
            chef === Chef.MASTERCHEF ? [pid, amount.quotient.toString()] : [pid, amount.quotient.toString(), address]
          ),
        },
      })

      if (onSuccess) {
        const ts = new Date().getTime()
        onSuccess({
          type: 'mint',
          chainId,
          txHash: data.hash,
          promise: data.wait(),
          summary: {
            pending: `Staking ${amount.toSignificant(6)} ${amount.currency.symbol} tokens`,
            completed: `Successfully staked ${amount.toSignificant(6)} ${amount.currency.symbol} tokens`,
            failed: `Something went wrong when staking ${amount.currency.symbol} tokens`,
          },
          groupTimestamp: ts,
          timestamp: ts,
        })
      }
    },
    [address, chainId, chef, contract, onSuccess, pid, sendTransactionAsync]
  )

  /**
   * @throws {Error}
   */
  const withdraw = useCallback(
    async (amount: Amount<Token> | undefined) => {
      if (!chainId) return console.error('useMasterChef: chainId not defined')
      if (!amount) return console.error('useMasterChef: amount not defined')
      if (!contract) return console.error('useMasterChef: contract not defined')

      const data = await sendTransactionAsync({
        request: {
          from: address,
          to: contract.address,
          data: contract.interface.encodeFunctionData(
            chef === Chef.MINICHEF ? 'withdrawAndHarvest' : 'withdraw',
            chef === Chef.MASTERCHEF ? [pid, amount.quotient.toString()] : [pid, amount.quotient.toString(), address]
          ),
        },
      })

      if (onSuccess) {
        const ts = new Date().getTime()
        onSuccess({
          type: 'burn',
          chainId,
          txHash: data.hash,
          promise: data.wait(),
          summary: {
            pending: `Unstaking ${amount.toSignificant(6)} ${amount.currency.symbol} tokens`,
            completed: `Successfully unstaked ${amount.toSignificant(6)} ${amount.currency.symbol} tokens`,
            failed: `Something went wrong when unstaking ${amount.currency.symbol} tokens`,
          },
          groupTimestamp: ts,
          timestamp: ts,
        })
      }
    },
    [address, chainId, chef, contract, onSuccess, pid, sendTransactionAsync]
  )

  /**
   * @throws {Error}
   */
  const harvest = useCallback(async () => {
    if (!chainId) return console.error('useMasterChef: chainId not defined')
    if (!data) return console.error('useMasterChef: could not fetch pending sushi and sushi balance')
    if (!contract) return console.error('useMasterChef: contract not defined')

    let tx
    if (chef === Chef.MASTERCHEF) {
      tx = await sendTransactionAsync({
        request: {
          from: address,
          to: contract.address,
          data: contract.interface.encodeFunctionData('deposit', [pid, ZERO]),
        },
      })
    } else if (chef === Chef.MASTERCHEF_V2) {
      if (pendingSushi && sushiBalance && pendingSushi.greaterThan(sushiBalance)) {
        tx = await sendTransactionAsync({
          request: {
            from: address,
            to: contract.address,
            data: contract.interface.encodeFunctionData('batch', [
              contract.interface.encodeFunctionData('harvestFromMasterChef'),
              contract.interface.encodeFunctionData('harvest', [pid, address]),
            ]),
          },
        })
      } else {
        tx = await sendTransactionAsync({
          request: {
            from: address,
            to: contract.address,
            data: contract.interface.encodeFunctionData('harvest', [pid, address]),
          },
        })
      }
    } else if (chef === Chef.MINICHEF) {
      tx = await sendTransactionAsync({
        request: {
          from: address,
          to: contract.address,
          data: contract.interface.encodeFunctionData('harvest', [pid, address]),
        },
      })
    }

    if (onSuccess && tx) {
      const ts = new Date().getTime()
      onSuccess({
        type: 'claimRewards',
        chainId,
        txHash: tx.hash,
        promise: tx.wait(),
        summary: {
          pending: `Claiming rewards`,
          completed: `Successfully claimed rewards`,
          failed: `Something went wrong when claiming rewards`,
        },
        groupTimestamp: ts,
        timestamp: ts,
      })
    }
  }, [chainId, data, chef, onSuccess, sendTransactionAsync, address, contract, pid, pendingSushi, sushiBalance])

  return useMemo(() => {
    return {
      deposit,
      withdraw,
      harvest,
      balance,
      isLoading,
      isError,
      pendingSushi,
      isWritePending,
      isWriteError,
    }
  }, [balance, deposit, harvest, isError, isLoading, isWriteError, isWritePending, pendingSushi, withdraw])
}
