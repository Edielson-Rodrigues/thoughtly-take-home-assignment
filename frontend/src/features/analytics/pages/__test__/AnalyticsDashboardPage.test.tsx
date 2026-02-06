import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../concerts/hooks/useConcerts');
vi.mock('../../hooks/useAnalytics');

import { ThemeProvider } from '../../../../context/ThemeContext';
import { useConcerts } from '../../../concerts/hooks/useConcerts';
import { useAnalytics } from '../../hooks/useAnalytics';
import { AnalyticsDashboardPage } from '../AnalyticsDashboardPage';

import type { Concert } from '../../../concerts/types';
import type { DashboardResponse } from '../../types';

const mockUseConcerts = vi.mocked(useConcerts);
const mockUseAnalytics = vi.mocked(useAnalytics);

describe('AnalyticsDashboardPage', () => {
  const mockConcerts: Concert[] = [
    {
      id: '1',
      name: 'Rock Concert',
      location: 'Stadium',
      date: '2024-12-25T20:00:00.000Z',
      description: 'Great show',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      name: 'Jazz Night',
      location: 'Club',
      date: '2024-12-31T21:00:00.000Z',
      description: 'Smooth jazz',
      createdAt: '2024-01-02T00:00:00.000Z',
    },
  ];

  const mockDashboard: DashboardResponse = {
    summary: {
      totalRevenue: 25000,
      totalTicketsSold: 150,
    },
    salesOverTime: [
      {
        date: '2024-01-01',
        revenue: 12000,
        tickets: 80,
      },
      {
        date: '2024-01-02',
        revenue: 13000,
        tickets: 70,
      },
    ],
    revenueByTier: [
      {
        tierName: 'VIP',
        concertName: 'Rock Concert',
        revenue: 15000,
        percentage: 60,
      },
      {
        tierName: 'General',
        concertName: 'Rock Concert',
        revenue: 10000,
        percentage: 40,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseConcerts.mockReturnValue({
      data: mockConcerts,
      isLoading: false,
      error: null,
    } as any);
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <ThemeProvider>
        <BrowserRouter>{component}</BrowserRouter>
      </ThemeProvider>,
    );
  };

  describe('loading state', () => {
    it('should render loading spinner when loading', () => {
      mockUseAnalytics.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      renderWithRouter(<AnalyticsDashboardPage />);

      expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should center loading content', () => {
      mockUseAnalytics.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      renderWithRouter(<AnalyticsDashboardPage />);

      const container = screen.getByText('Loading analytics...').closest('.min-h-screen');
      expect(container).toHaveClass('flex', 'items-center', 'justify-center');
    });
  });

  describe('error state', () => {
    it('should render error message when error occurs', () => {
      mockUseAnalytics.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
      } as any);

      renderWithRouter(<AnalyticsDashboardPage />);

      expect(screen.getByText(/Failed to load analytics/i)).toBeInTheDocument();
      expect(screen.getByText(/Please try again later/i)).toBeInTheDocument();
    });

    it('should render error using Alert component', () => {
      mockUseAnalytics.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
      } as any);

      renderWithRouter(<AnalyticsDashboardPage />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });
  });

  describe('success state with data', () => {
    beforeEach(() => {
      mockUseAnalytics.mockReturnValue({
        data: mockDashboard,
        isLoading: false,
        error: null,
      } as any);
    });

    it('should render page header with title', () => {
      renderWithRouter(<AnalyticsDashboardPage />);

      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Track sales performance and revenue metrics')).toBeInTheDocument();
    });

    it('should render ThemeToggle component', () => {
      renderWithRouter(<AnalyticsDashboardPage />);

      const themeToggle = screen.getByRole('button', { name: /switch to/i });
      expect(themeToggle).toBeInTheDocument();
    });

    it('should render Concerts navigation link', () => {
      renderWithRouter(<AnalyticsDashboardPage />);

      const concertsLink = screen.getByRole('link', { name: /concerts/i });
      expect(concertsLink).toBeInTheDocument();
      expect(concertsLink).toHaveAttribute('href', '/');
    });

    it('should render filter section with all filters', () => {
      renderWithRouter(<AnalyticsDashboardPage />);

      expect(screen.getByText('Concert')).toBeInTheDocument();
      expect(screen.getByText('Group By')).toBeInTheDocument();
      expect(screen.getByText('Start Date')).toBeInTheDocument();
      expect(screen.getByText('End Date')).toBeInTheDocument();
    });

    it('should render concert options in select', () => {
      renderWithRouter(<AnalyticsDashboardPage />);

      expect(screen.getByRole('option', { name: 'All Concerts' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Rock Concert' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Jazz Night' })).toBeInTheDocument();
    });

    it('should render period options in Group By select', () => {
      renderWithRouter(<AnalyticsDashboardPage />);

      expect(screen.getByRole('option', { name: 'Day' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Week' })).toBeInTheDocument();
    });

    it('should render Total Revenue stat card', () => {
      renderWithRouter(<AnalyticsDashboardPage />);

      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('$25,000.00')).toBeInTheDocument();
    });

    it('should render Tickets Sold stat card', () => {
      renderWithRouter(<AnalyticsDashboardPage />);

      expect(screen.getByText('Tickets Sold')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    it('should render Sales Over Time chart section', () => {
      renderWithRouter(<AnalyticsDashboardPage />);

      expect(screen.getByText('Sales Over Time')).toBeInTheDocument();
    });

    it('should render Revenue by Tier chart section', () => {
      renderWithRouter(<AnalyticsDashboardPage />);

      expect(screen.getByText('Revenue by Tier')).toBeInTheDocument();
    });
  });

  describe('empty data state', () => {
    it('should show no sales data message when salesOverTime is empty', () => {
      mockUseAnalytics.mockReturnValue({
        data: {
          ...mockDashboard,
          salesOverTime: [],
        },
        isLoading: false,
        error: null,
      } as any);

      renderWithRouter(<AnalyticsDashboardPage />);

      expect(screen.getByText('No sales data available')).toBeInTheDocument();
    });

    it('should show no tier data message when revenueByTier is empty', () => {
      mockUseAnalytics.mockReturnValue({
        data: {
          ...mockDashboard,
          revenueByTier: [],
        },
        isLoading: false,
        error: null,
      } as any);

      renderWithRouter(<AnalyticsDashboardPage />);

      expect(screen.getByText('No tier data available')).toBeInTheDocument();
    });

    it('should render stat cards with zero values when data is empty', () => {
      mockUseAnalytics.mockReturnValue({
        data: {
          summary: {
            totalRevenue: 0,
            totalTicketsSold: 0,
          },
          salesOverTime: [],
          revenueByTier: [],
        },
        isLoading: false,
        error: null,
      } as any);

      renderWithRouter(<AnalyticsDashboardPage />);

      expect(screen.getByText('$0.00')).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('filter interactions', () => {
    beforeEach(() => {
      mockUseAnalytics.mockReturnValue({
        data: mockDashboard,
        isLoading: false,
        error: null,
      } as any);
    });

    it('should update concert filter when selecting a concert', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AnalyticsDashboardPage />);

      const selects = screen.getAllByRole('combobox');
      const concertSelect = selects[0];
      await user.selectOptions(concertSelect, '1');

      await waitFor(() => {
        expect(mockUseAnalytics).toHaveBeenCalledWith(expect.objectContaining({ concertId: '1' }));
      });
    });

    it('should update period filter when changing Group By', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AnalyticsDashboardPage />);

      const selects = screen.getAllByRole('combobox');
      const periodSelect = selects[1];
      await user.selectOptions(periodSelect, 'week');

      await waitFor(() => {
        expect(mockUseAnalytics).toHaveBeenCalledWith(expect.objectContaining({ period: 'week' }));
      });
    });

    it('should reset concert filter when selecting All Concerts', async () => {
      const user = userEvent.setup();
      renderWithRouter(<AnalyticsDashboardPage />);

      const selects = screen.getAllByRole('combobox');
      const concertSelect = selects[0];
      await user.selectOptions(concertSelect, '1');
      await user.selectOptions(concertSelect, '');

      await waitFor(() => {
        expect(mockUseAnalytics).toHaveBeenLastCalledWith(
          expect.objectContaining({ concertId: undefined }),
        );
      });
    });

    it('should handle start date input', async () => {
      const user = userEvent.setup();
      const { container } = renderWithRouter(<AnalyticsDashboardPage />);

      const dateInputs = container.querySelectorAll('input[type="date"]');
      const startDateInput = dateInputs[0];
      await user.type(startDateInput, '2024-01-01');

      await waitFor(() => {
        expect(mockUseAnalytics).toHaveBeenCalledWith(
          expect.objectContaining({ startDate: expect.any(String) }),
        );
      });
    });

    it('should handle end date input', async () => {
      const user = userEvent.setup();
      const { container } = renderWithRouter(<AnalyticsDashboardPage />);

      const dateInputs = container.querySelectorAll('input[type="date"]');
      const endDateInput = dateInputs[1];
      await user.type(endDateInput, '2024-12-31');

      await waitFor(() => {
        expect(mockUseAnalytics).toHaveBeenCalledWith(
          expect.objectContaining({ endDate: expect.any(String) }),
        );
      });
    });

    it('should clear start date filter when input is cleared', async () => {
      const user = userEvent.setup();
      const { container } = renderWithRouter(<AnalyticsDashboardPage />);

      const dateInputs = container.querySelectorAll('input[type="date"]');
      const startDateInput = dateInputs[0] as HTMLInputElement;
      await user.type(startDateInput, '2024-01-01');
      await user.clear(startDateInput);

      await waitFor(() => {
        expect(mockUseAnalytics).toHaveBeenLastCalledWith(
          expect.objectContaining({ startDate: undefined }),
        );
      });
    });
  });

  describe('responsive design', () => {
    beforeEach(() => {
      mockUseAnalytics.mockReturnValue({
        data: mockDashboard,
        isLoading: false,
        error: null,
      } as any);
    });

    it('should have responsive header padding', () => {
      renderWithRouter(<AnalyticsDashboardPage />);

      const header = screen.getByRole('banner');
      const headerContent = header.querySelector('.max-w-7xl');
      expect(headerContent).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
    });

    it('should have responsive main content padding', () => {
      renderWithRouter(<AnalyticsDashboardPage />);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
    });
  });

  describe('layout structure', () => {
    beforeEach(() => {
      mockUseAnalytics.mockReturnValue({
        data: mockDashboard,
        isLoading: false,
        error: null,
      } as any);
    });

    it('should have min-h-screen on main container', () => {
      const { container } = renderWithRouter(<AnalyticsDashboardPage />);

      const mainContainer = container.querySelector('.min-h-screen.bg-gray-50');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should have header with shadow', () => {
      renderWithRouter(<AnalyticsDashboardPage />);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('shadow-sm');
    });

    it('should have max-width constraint on content', () => {
      renderWithRouter(<AnalyticsDashboardPage />);

      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveClass('max-w-7xl', 'mx-auto');
    });

    it('should render filter card before stats', () => {
      renderWithRouter(<AnalyticsDashboardPage />);

      expect(screen.getByText('Concert')).toBeInTheDocument();
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    });

    it('should render stats before charts', () => {
      const { container } = renderWithRouter(<AnalyticsDashboardPage />);

      const statsSection = screen.getByText('Total Revenue').closest('.mb-8');
      const chartsSection = container.querySelector('.space-y-8');

      expect(statsSection).toBeInTheDocument();
      expect(chartsSection).toBeInTheDocument();
    });
  });

  describe('data integration', () => {
    it('should call useAnalytics with default filters on mount', () => {
      mockUseAnalytics.mockReturnValue({
        data: mockDashboard,
        isLoading: false,
        error: null,
      } as any);

      renderWithRouter(<AnalyticsDashboardPage />);

      expect(mockUseAnalytics).toHaveBeenCalledWith({ period: 'day' });
    });

    it('should call useConcerts hook on mount', () => {
      mockUseAnalytics.mockReturnValue({
        data: mockDashboard,
        isLoading: false,
        error: null,
      } as any);

      renderWithRouter(<AnalyticsDashboardPage />);

      expect(mockUseConcerts).toHaveBeenCalled();
    });

    it('should render when concerts data is loading', () => {
      mockUseConcerts.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);
      mockUseAnalytics.mockReturnValue({
        data: mockDashboard,
        isLoading: false,
        error: null,
      } as any);

      renderWithRouter(<AnalyticsDashboardPage />);

      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Concert')).toBeInTheDocument();
    });
  });
});
