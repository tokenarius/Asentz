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
    Swap: { href: 'https://www.sushi.com/swap' },
    Earn: { href: 'https://www.sushi.com/earn' },
    'Lending & Borrowing': { href: 'https://app.sushi.com/kashi', target: '_blank', rel: 'noopener noreferrer' },
    'Miso Launchpad': { href: 'https://app.sushi.com/miso', target: '_blank', rel: 'noopener noreferrer' },
    'Shoyu NFT': { href: 'https://shoyunft.com', target: '_blank', rel: 'noopener noreferrer' },
    Payments: { href: 'https://www.sushi.com/furo' },
    Analytics: { href: 'https://www.sushi.com/analytics' },
  },
  Help: {
    'About Us': { href: 'https://docs.sushi.com', target: '_blank', rel: 'noopener noreferrer' },
    'Discord Support': { href: 'https://discord.gg/NVPXN4e', target: '_blank', rel: 'noopener noreferrer' },
    'Twitter Support': { href: 'https://twitter.com/sushiswap', target: '_blank', rel: 'noopener noreferrer' },
    'Forum Support': { href: 'https://forum.sushi.com', target: '_blank', rel: 'noopener noreferrer' },
  },
  Developers: {
    GitBook: { href: 'https://docs.sushi.com', target: '_blank', rel: 'noopener noreferrer' },
    GitHub: { href: 'https://github.com/sushiswap', target: '_blank', rel: 'noopener noreferrer' },
    Development: { href: 'https://dev.sushi.com', target: '_blank', rel: 'noopener noreferrer' },
    SushiGuard: { href: 'https://docs.openmev.org', target: '_blank', rel: 'noopener noreferrer' },
  },
  Items: [
    {
      Governance: {
        'Forum & Proposals': { href: 'https://forum.sushi.com', target: '_blank', rel: 'noopener noreferrer' },
        Vote: { href: 'https://snapshot.org/#/sushigov.eth', target: '_blank', rel: 'noopener noreferrer' },
      },
    },
    {
      Partners: {
        KlimaDAO: { href: 'https://www.klimadao.finance/', target: '_blank', rel: 'noopener noreferrer' },
        'Manifold Finance': { href: 'https://www.manifoldfinance.com/', target: '_blank', rel: 'noopener noreferrer' },
      },
    },
  ],
  Protocol: {
    'Apply for Onsen': {
      href: 'https://docs.google.com/document/d/1VcdrqAn1sR8Wa0BSSU-jAl68CfoECR62LCzIyzUpZ_U',
      target: '_blank',
      rel: 'noopener noreferrer',
    },
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
            <SushiWithTextIcon height={20} className="text-slate-50" />
          </div>
          <div className="text-sm sm:text-[0.625rem] leading-5 sm:leading-4 text-slate-400">
            Our community is building a comprehensive decentralized trading platform for the future of finance. Join us!
          </div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/sushiswap" target="_blank" rel="noopener noreferrer">
              <GithubIcon width={16} className="text-slate-300 hover:text-slate-50" />
            </a>
            <a href="https://twitter.com/sushiswap" target="_blank" rel="noopener noreferrer">
              <TwitterIcon width={16} className="text-slate-300 hover:text-slate-50" />
            </a>
            <a href="https://instagram.com/instasushiswap" target="_blank" rel="noopener noreferrer">
              <InstagramIcon width={16} className="text-slate-300 hover:text-slate-50" />
            </a>
            <a href="https://medium.com/sushiswap-org" target="_blank" rel="noopener noreferrer">
              <MediumIcon width={16} className="text-slate-300 hover:text-slate-50" />
            </a>
            <a href="https://discord.gg/NVPXN4e" target="_blank" rel="noopener noreferrer">
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
            Copyright © 2022 Sushi. All rights reserved.
          </Typography>
          <div className="flex divide-x divide-slate-200/20 gap-">
            <Link.Internal href="https://www.sushi.com/terms-of-use" passHref={true}>
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
