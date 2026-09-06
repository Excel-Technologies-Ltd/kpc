import { privateRoutes } from '@/router/private-route';
import { publicRoutes } from '@/router/public-route';
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([...privateRoutes, ...publicRoutes], {
  basename: '/portal',
});
