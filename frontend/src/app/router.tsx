import { createBrowserRouter } from 'react-router-dom';

import { ConcertCatalogPage } from '../features/concerts';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ConcertCatalogPage />,
  },
]);
