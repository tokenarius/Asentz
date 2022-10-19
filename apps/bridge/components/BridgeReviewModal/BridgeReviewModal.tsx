import { Button, Dots } from '@sushiswap/ui'
import { Approve, BENTOBOX_ADDRESS, getSushiXSwapContractConfig } from '@sushiswap/wagmi'
import React, { FC, ReactNode, useState } from 'react'
import { useAccount } from 'wagmi'

import { useNotifications } from '../../lib/state/storage'
import { useBridgeExecute } from '../BridgeExecuteProvider'
import { useBridgeState } from '../BridgeStateProvider'
import { BridgeReviewModalBase } from './BridgeReviewModalBase'

interface BridgeReviewModal {
  children({ isWritePending, setOpen }: { isWritePending: boolean; setOpen(open: boolean): void }): ReactNode
}

export const BridgeReviewModal: FC<BridgeReviewModal> = ({ children }) => {
  const { address } = useAccount()
  const [open, setOpen] = useState(false)
  const [, { createNotification }] = useNotifications(address)
  const { srcChainId, amount } = useBridgeState()
  const { execute, isWritePending, setSignature } = useBridgeExecute()

  return (
    <>
      {children({ isWritePending, setOpen })}
      <BridgeReviewModalBase open={open} setOpen={setOpen}>
        <Approve
          className="flex-grow !justify-end pt-4"
          onSuccess={createNotification}
          components={
            <Approve.Components>
              <Approve.Bentobox
                size="md"
                className="whitespace-nowrap"
                fullWidth
                address={getSushiXSwapContractConfig(srcChainId).addressOrName}
                onSignature={setSignature}
              />
              <Approve.Token
                size="md"
                className="whitespace-nowrap"
                fullWidth
                amount={amount}
                address={BENTOBOX_ADDRESS[srcChainId]}
              />
            </Approve.Components>
          }
          render={({ approved }) => {
            return (
              <Button size="md" disabled={!approved || isWritePending} fullWidth onClick={execute}>
                {isWritePending ? <Dots>Confirm Bridging</Dots> : 'Bridge'}
              </Button>
            )
          }}
        />
      </BridgeReviewModalBase>
    </>
  )
}
