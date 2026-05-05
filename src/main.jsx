import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './routers/router.jsx'
import { GlobalProvider } from './context/GlobalContext.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  //   <RouterProvider router={router} />
  // </StrictMode>,
  <>
    <RouterProvider router={router} />
  </>
)
