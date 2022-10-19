import { PaperAirplaneIcon } from '@heroicons/react/outline'
import { useIsMounted } from '@sushiswap/hooks'
import { App, Menu } from '@sushiswap/ui'
import { AppType } from '@sushiswap/ui/app/Header'
import { Wallet } from '@sushiswap/wagmi'
import { SUPPORTED_CHAINS } from 'config'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC } from 'react'
import { useAccount, useConnect } from 'wagmi'

export const Header: FC = () => {
  const isMounted = useIsMounted()
  const { address, isConnected } = useAccount()
  const router = useRouter()

  const connect = useConnect({
    onSuccess: () => {
      if (router.pathname === '/') {
        void router.push('/dashboard')
      }
    },
  })

  return (
    <App.Header
      appType={AppType.Furo}
      className={router.pathname === '/' ? '' : 'bg-slate-900 border-b border-slate-200/5'}
      withScrollBackground={router.pathname === '/'}
    >
      <div className="flex items-center gap-2 whitespace-nowrap">
        <Wallet.Button
          size="sm"
          hack={connect}
          supportedNetworks={SUPPORTED_CHAINS}
          className="border-none shadow-md"
        />
        {address && isMounted && isConnected && (
          <Menu
            button={
              <Menu.Button
                color="blue"
                fullWidth
                startIcon={<PaperAirplaneIcon width={18} className="transform rotate-45 -mt-0.5" />}
                size="sm"
                as="div"
              >
                Pay Someone
              </Menu.Button>
            }
          >
            <Menu.Items unmount={false} className="!min-w-0">
              <Link passHref={true} href="/stream/create">
                <Menu.Item as="a">Stream</Menu.Item>
              </Link>
              <Link passHref={true} href="/vesting/create">
                <Menu.Item as="a">Vesting</Menu.Item>
              </Link>
            </Menu.Items>
          </Menu>
        )}
      </div>
    </App.Header>
  )
}
