import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { AppLayout } from './layout';
import HomeRoute from './routes/home';
import FuzzyNumbersRoute from './routes/fuzzy-numbers';
import FuzzySetsRoute from './routes/fuzzy-sets';

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomeRoute /> },
      { path: '/fuzzy-numbers', element: <FuzzyNumbersRoute /> },
      { path: '/fuzzy-sets', element: <FuzzySetsRoute /> },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
