
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);

// Register Service Worker only in production and clean up in development
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[SW] Registered:', reg.scope)
        })
        .catch((err) => {
          console.warn('[SW] Registration failed:', err)
        })
    })
  } else {
    // In development, unregister any existing service workers and clear caches
    navigator.serviceWorker.getRegistrations().then((regs) => {
      if (regs.length) {
        console.log('[SW] Unregistering existing Service Workers in dev...')
        regs.forEach((reg) => {
          reg.unregister().then((ok) => {
            if (ok) console.log('[SW] Unregistered:', reg.scope)
          })
        })
      }
    })

    if ('caches' in window) {
      caches.keys().then((keys) => {
        if (keys.length) console.log('[SW] Clearing caches in dev...', keys)
        keys.forEach((key) => caches.delete(key))
      })
    }
  }
}
