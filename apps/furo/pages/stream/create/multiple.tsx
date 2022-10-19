import { Breadcrumb, BreadcrumbLink } from '@sushiswap/ui'
import { Layout } from 'components'
import { CreateMultipleForm } from 'components/stream'
import { NextSeo } from 'next-seo'

const LINKS: BreadcrumbLink[] = [
  {
    href: '/stream/create',
    label: 'Create Stream',
  },
  {
    href: '/stream/create/multiple',
    label: 'Multiple',
  },
]

const MultipleStream = () => {
  return (
    <>
      <NextSeo title="New Streams" />
      <Layout>
        <Breadcrumb home="/dashboard" links={LINKS} />
        <div className="mt-6">
          <CreateMultipleForm />
        </div>
      </Layout>
    </>
  )
}

export default MultipleStream
