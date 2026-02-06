import { createBrowserRouter } from 'react-router-dom';

import { AnalyticsDashboardPage } from '../features/analytics';
import { ConcertCatalogPage } from '../features/concerts';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ConcertCatalogPage />,
  },
  {
    path: '/analytics',
    element: <AnalyticsDashboardPage />,
  },
]);
