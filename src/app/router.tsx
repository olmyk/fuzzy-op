import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { paths } from '@/config/paths';
import HomeRoute from '@/app/routes/home';

const router = createBrowserRouter([
  {
    path: paths.home.path,
    element: <HomeRoute/>,
  },
])

export const AppRouter = () => {
  return <RouterProvider router={router} />
}