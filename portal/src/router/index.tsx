import { privateRoutes } from '@/router/private-route';
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter(privateRoutes, {
  basename: '/portal',
});
