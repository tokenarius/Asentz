import { useCallback } from 'react'

import {
  Container,
  DiscordIcon,
  GithubIcon,
  InstagramIcon,
  Link,
  MediumIcon,
  SushiWithTextIcon,
  TwitterIcon,
  Typography,
} from '..'

export type FooterProps = React.HTMLProps<HTMLDivElement>

const config: Record<
  string,
  | Record<string, { href: string; rel?: string; target?: string }>
  | Array<Record<string, Record<string, { href: string; rel?: string; target?: string }>>>
> = {
  Services: {
    'Dashboard': { href: '/analytics' },
    'Swap': { href: '/swap' },
    'xSwap': { href: '/xswap' },
    'Pool & Staking': { href: '/earn' },
  },
  Help: {
    'About Us': { href: '', target: '_blank', rel: 'noopener noreferrer' },
    'Discord Support': { href: '', target: '_blank', rel: 'noopener noreferrer' },
    'Twitter Support': { href: '', target: '_blank', rel: 'noopener noreferrer' },
  },
}

export function Footer(props: FooterProps): JSX.Element {
  const leafNode = useCallback(
    (title: string, items: Record<string, { href: string; rel?: string; target?: string }>) => {
      return (
        <div key={title} className="flex flex-col gap-[10px]">
          <Typography variant="xs" weight={500} className="text-sm sm:text-xs text-slate-100">
            {title}
          </Typography>
          {Object.entries(items).map(([item, { href, rel, target }]) => (
            <a
              key={item}
              href={href}
              target={target}
              rel={rel}
              className="text-sm cursor-pointer sm:text-xs text-slate-400 hover:underline"
            >
              {item}
            </a>
          ))}
        </div>
      )
    },
    []
  )

  return (
    <footer className="hidden sm:flex flex-col border-t border-slate-400/5 pt-[72px]" {...props}>
      <Container maxWidth="5xl" className="grid grid-cols-1 md:grid-cols-[176px_auto] mx-auto px-4 gap-4">
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-start gap-3 pt-2">
            {/* <SushiWithTextIcon height={20} className="text-slate-50" /> */}
            ASENTZ 1.0
          </div>
          <div className="text-sm sm:text-[0.625rem] leading-5 sm:leading-4 text-slate-400">
            Our community is building a comprehensive decentralized trading platform for the future of finance. Join us!
          </div>
          <div className="flex items-center gap-4">
            <a href="/sushiswap" target="_blank" rel="noopener noreferrer">
              <GithubIcon width={16} className="text-slate-300 hover:text-slate-50" />
            </a>
            <a href="/sushiswap" target="_blank" rel="noopener noreferrer">
              <TwitterIcon width={16} className="text-slate-300 hover:text-slate-50" />
            </a>
            <a href="/instasushiswap" target="_blank" rel="noopener noreferrer">
              <InstagramIcon width={16} className="text-slate-300 hover:text-slate-50" />
            </a>
            <a href="/sushiswap-org" target="_blank" rel="noopener noreferrer">
              <MediumIcon width={16} className="text-slate-300 hover:text-slate-50" />
            </a>
            <a href="/NVPXN4e" target="_blank" rel="noopener noreferrer">
              <DiscordIcon width={16} className="text-slate-300 hover:text-slate-50" />
            </a>
          </div>
        </div>
        <div className="md:px-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-[40px] sm:mt-[10px]">
          {Object.entries(config).map(([title, items], i) => {
            if (Array.isArray(items)) {
              return (
                <div key={i} className="flex flex-col gap-6">
                  {items.map((item) =>
                    Object.entries(item).map(([_title, _items]) => {
                      return leafNode(_title, _items)
                    })
                  )}
                </div>
              )
            } else {
              return leafNode(title, items)
            }
          })}
        </div>
      </Container>
      <Container maxWidth="5xl" className="mx-auto mt-20 mb-5">
        <div className="flex justify-between py-2 mx-4 border-t border-slate-800">
          <Typography variant="xs" className="text-slate-400">
            Copyright © 2022 ASENTZ. All rights reserved.
          </Typography>
          <div className="flex divide-x divide-slate-200/20 gap-">
            <Link.Internal href="/terms-of-use" passHref={true}>
              <Typography as="a" variant="xs" weight={500} className="px-3 text-slate-300">
                Terms of Use
              </Typography>
            </Link.Internal>
            {/*<Link.Internal href="/privacy-policy" passHref={true}>*/}
            {/*  <Typography as="a" variant="xs" weight={500} className="pl-3 text-slate-300">*/}
            {/*    Privacy Policy*/}
            {/*  </Typography>*/}
            {/*</Link.Internal>*/}
          </div>
        </div>
      </Container>
    </footer>
  )
}

export default Footer
