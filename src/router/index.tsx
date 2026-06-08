import { createHashRouter, Navigate } from 'react-router-dom';
import App from '@/App';
import HomePage from '@/pages/Home';
import ManualPage from '@/pages/Manual';
import DrugPage from '@/pages/Drug';
import DrugDetail from '@/pages/DrugDetail';
import TimelinePage from '@/pages/Timeline';
import RiskPage from '@/pages/Risk';
import GuidePage from '@/pages/Guide';
import FeedbackPage from '@/pages/Feedback';
import PharmacistPage from '@/pages/Pharmacist';
import PrintPage from '@/pages/Print';
import PrivacyPage from '@/pages/Privacy';

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <HomePage />,
      },
      {
        path: 'manual',
        element: <ManualPage />,
      },
      {
        path: 'drug/:code',
        element: <DrugPage />,
        children: [
          {
            path: '',
            element: <DrugDetail />,
          },
          {
            path: 'timeline',
            element: <TimelinePage />,
          },
          {
            path: 'risk',
            element: <RiskPage />,
          },
          {
            path: 'guide',
            element: <GuidePage />,
          },
        ],
      },
      {
        path: 'feedback',
        element: <FeedbackPage />,
      },
      {
        path: 'pharmacist',
        element: <PharmacistPage />,
      },
      {
        path: 'print/:code',
        element: <PrintPage />,
      },
      {
        path: 'privacy',
        element: <PrivacyPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default router;
