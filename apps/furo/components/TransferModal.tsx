import { ContractInterface } from '@ethersproject/contracts'
import { PaperAirplaneIcon } from '@heroicons/react/outline'
import { ChainId } from '@sushiswap/chain'
import { shortenAddress } from '@sushiswap/format'
import { ZERO } from '@sushiswap/math'
import { Button, createToast, Dialog, Dots, Form, Typography } from '@sushiswap/ui'
import { Web3Input } from '@sushiswap/wagmi'
import { Stream, Vesting } from 'lib'
import { FC, useCallback, useState } from 'react'
import { useAccount, useDeprecatedContractWrite, useEnsAddress, useNetwork } from 'wagmi'

interface TransferModalProps {
  stream?: Stream | Vesting
  abi: ContractInterface
  address: string
  fn?: string
}

export const TransferModal: FC<TransferModalProps> = ({
  stream,
  abi,
  address: contractAddress,
  fn = 'transferFrom',
}) => {
  const { address } = useAccount()
  const { chain: activeChain } = useNetwork()
  const [open, setOpen] = useState(false)
  const [recipient, setRecipient] = useState<string>()
  const [error, setError] = useState<string>()
  const { data: resolvedAddress } = useEnsAddress({
    name: recipient,
    chainId: ChainId.ETHEREUM,
  })

  const { writeAsync, isLoading: isWritePending } = useDeprecatedContractWrite({
    addressOrName: contractAddress,
    contractInterface: abi,
    functionName: fn,
    onSuccess() {
      setOpen(false)
    },
  })

  const transferStream = useCallback(async () => {
    if (!stream || !address || !recipient || !resolvedAddress || !activeChain?.id) return
    setError(undefined)

    try {
      const data = await writeAsync({ args: [address, resolvedAddress, stream?.id] })
      const ts = new Date().getTime()
      createToast({
        type: 'transferStream',
        txHash: data.hash,
        chainId: activeChain.id,
        timestamp: ts,
        groupTimestamp: ts,
        promise: data.wait(),
        summary: {
          pending: <Dots>Transferring stream</Dots>,
          completed: `Successfully transferred stream to ${shortenAddress(resolvedAddress)}`,
          failed: 'Something went wrong transferring the stream',
        },
      })
    } catch (e: any) {
      setError(e.message)
    }

    setRecipient(undefined)
  }, [address, activeChain?.id, recipient, resolvedAddress, stream, writeAsync])

  if (!stream || stream?.isEnded) return null

  return (
    <>
      <Button
        color="gray"
        fullWidth
        startIcon={<PaperAirplaneIcon width={18} height={18} className="transform rotate-45 mt-[-4px] ml-0.5" />}
        disabled={
          !address ||
          stream?.chainId !== activeChain?.id ||
          !stream?.canTransfer(address) ||
          !stream?.remainingAmount?.greaterThan(ZERO)
        }
        onClick={() => setOpen(true)}
      >
        Transfer
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <Dialog.Content className="space-y-3 !max-w-xs">
          <Dialog.Header title="Transfer Stream" onClose={() => setOpen(false)} />
          <Typography variant="xs" weight={400} className="text-slate-400">
            This will transfer a stream consisting of{' '}
            <span className="font-medium text-slate-200">
              {stream?.remainingAmount?.toSignificant(6)} {stream?.remainingAmount?.currency.symbol}
            </span>{' '}
            to the entered recipient.
            <p className="mt-2">
              Please note that this will transfer ownership of the entire stream to the recipient. You will not be able
              to withdraw from this stream after transferring
            </p>
          </Typography>
          <Form.Control label="Recipient">
            <Web3Input.Ens
              id="ens-input"
              value={recipient}
              onChange={setRecipient}
              placeholder="Address or ENS Name"
              className="ring-offset-slate-800"
            />
          </Form.Control>

          {error && (
            <Typography variant="xs" className="text-center text-red" weight={500}>
              {error}
            </Typography>
          )}
          <Dialog.Actions>
            <Button
              variant="filled"
              color="gradient"
              fullWidth
              disabled={
                isWritePending ||
                !resolvedAddress ||
                resolvedAddress.toLowerCase() == stream?.recipient.id.toLowerCase()
              }
              onClick={transferStream}
            >
              {isWritePending ? (
                <Dots>Confirm Transfer</Dots>
              ) : resolvedAddress?.toLowerCase() == stream?.recipient.id.toLowerCase() ? (
                'Invalid recipient'
              ) : !resolvedAddress ? (
                'Enter recipient'
              ) : (
                'Transfer'
              )}
            </Button>
          </Dialog.Actions>
        </Dialog.Content>
      </Dialog>
    </>
  )
}
