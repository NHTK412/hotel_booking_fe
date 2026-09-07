import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './routers/router.jsx'
import { ConfigProvider, App } from 'antd'
import viVN from 'antd/locale/vi_VN'
import { antdTheme } from './config/themeConfig'
import { GlobalProvider } from './context/GlobalContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider theme={antdTheme} locale={viVN}>
      <App>
        <GlobalProvider>
          <RouterProvider router={router} />
        </GlobalProvider>
      </App>
    </ConfigProvider>
  </StrictMode>
)
