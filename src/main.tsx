import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './i18n'
import './styles/theme.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root not found')
}

// Suspense waits for the active language file before the first render.
createRoot(rootElement).render(
  <StrictMode>
    <Suspense fallback={null}>
      <App />
    </Suspense>
  </StrictMode>,
)
