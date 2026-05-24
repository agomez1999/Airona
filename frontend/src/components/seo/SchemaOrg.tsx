import { Helmet } from 'react-helmet-async'

interface Props {
  schema: Record<string, unknown> | Record<string, unknown>[]
}

export function SchemaOrg({ schema }: Props) {
  const json = Array.isArray(schema)
    ? { '@context': 'https://schema.org', '@graph': schema }
    : { '@context': 'https://schema.org', ...schema }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(json)}</script>
    </Helmet>
  )
}
