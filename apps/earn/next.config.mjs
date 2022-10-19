// import nextPwa from 'next-pwa'
import transpileModules from 'next-transpile-modules'
import { withAxiom } from 'next-axiom'

// const withPwa = nextPwa({
//   dest: 'public',
// })

const withTranspileModules = transpileModules([
  '@sushiswap/redux-token-lists',
  '@sushiswap/redux-localstorage',
  '@sushiswap/wagmi',
  '@sushiswap/ui',
  '@sushiswap/graph-client',
])

// @ts-check
/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/earn',
  reactStrictMode: true,
  swcMinify: false,
  images: {
    loader: 'cloudinary',
    path: 'https://res.cloudinary.com/sushi-cdn/image/fetch/',
  },
  productionBrowserSourceMaps: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/earn',
        permanent: true,
        basePath: false,
      },
    ]
  },
}

// export default withAxiom(withPwa(withTranspileModules(nextConfig)))
export default withAxiom(withTranspileModules(nextConfig))
