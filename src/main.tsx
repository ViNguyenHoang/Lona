import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <MantineProvider forceColorScheme="light">
        <Notifications position="bottom-center" />
        <App />
      </MantineProvider>
    </BrowserRouter>
  </StrictMode>,
)
