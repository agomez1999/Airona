import '@/i18n/config'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { AppRoutes } from '@/app/AppRoutes'

export function render(url: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity, enabled: false } },
  })
  const helmetContext: Record<string, unknown> = {}

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <StaticRouter location={url}>
          <AppRoutes />
        </StaticRouter>
      </QueryClientProvider>
    </HelmetProvider>
  )

  return { html, helmetContext }
}
