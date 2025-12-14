import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

// Start the worker with specific configuration
export async function startMockServiceWorker() {
  console.log('[MSW] Starting Mock Service Worker...')
  console.log('[MSW] Current MODE:', import.meta.env.MODE)
  console.log('[MSW] VITE_E2E:', import.meta.env.VITE_E2E)
  console.log('[MSW] VITE_API_URL:', import.meta.env.VITE_API_URL)
  console.log('[MSW] Number of handlers registered:', handlers.length)

  await worker.start({
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
    onUnhandledRequest: 'warn', // Warn but don't fail on unmocked requests
    quiet: false, // Show MSW logs
  })

  console.log('[MSW] ✅ Mock Service Worker started successfully in E2E mode')
  console.log('[MSW] Ready to intercept requests')
}
