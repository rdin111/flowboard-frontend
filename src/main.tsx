import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { router } from './routes/router'
import { RouterProvider } from 'react-router-dom'
import { store } from './app/store';
import { Provider } from 'react-redux';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <Provider store={store}>
          <RouterProvider router={router} />
      </Provider>

  </StrictMode>,
)
