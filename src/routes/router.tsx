import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';

// Import components that are part of the main layout directly
import App from '../App';
import ErrorPage from '../pages/ErrorPage';

// Lazy load the page components for code-splitting
const HomePage = lazy(() => import('../pages/HomePage'));
const BoardPage = lazy(() => import('../pages/BoardPage'));

export const router = createBrowserRouter([
    {
        path: '/',
        Component: App,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                Component: HomePage,
            },
            {
                path: 'board/:boardId',
                Component: BoardPage,
            },
        ],
    },
]);