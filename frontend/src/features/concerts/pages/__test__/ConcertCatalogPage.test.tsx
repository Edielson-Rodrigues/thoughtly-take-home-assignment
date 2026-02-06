import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// eslint-disable-next-line import/order
import { ThemeProvider } from '../../../../context/ThemeContext';

vi.mock('../../components/ConcertCard', () => ({
  ConcertCard: ({ concert }: { concert: any }) => (
    <div data-testid={`concert-card-${concert.id}`}>
      <h3>{concert.name}</h3>
      <p>{concert.location}</p>
    </div>
  ),
}));

vi.mock('../../hooks/useConcerts');
vi.mock('../../hooks/useConcertSSE');

import { useConcerts } from '../../hooks/useConcerts';
import { useConcertSSE } from '../../hooks/useConcertSSE';
import { ConcertCatalogPage } from '../ConcertCatalogPage';

import type { Concert } from '../../types';

const mockUseConcerts = vi.mocked(useConcerts);
const mockUseConcertSSE = vi.mocked(useConcertSSE);

describe('ConcertCatalogPage', () => {
  const mockConcerts: Concert[] = [
    {
      id: '1',
      name: 'The Beatles Reunion',
      location: 'Abbey Road Studios',
      date: '2024-12-25T20:00:00.000Z',
      description: 'Legendary band reunion',
      ticketTiers: [
        {
          id: 'tier1',
          name: 'VIP',
          price: 150,
          availableQuantity: 50,
          totalQuantity: 100,
          concertId: '1',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'tier2',
          name: 'General',
          price: 75,
          availableQuantity: 200,
          totalQuantity: 300,
          concertId: '1',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      name: 'Led Zeppelin Live',
      location: 'Madison Square Garden',
      date: '2024-12-31T21:00:00.000Z',
      description: 'Rock legends live',
      ticketTiers: [
        {
          id: 'tier3',
          name: 'Premium',
          price: 200,
          availableQuantity: 30,
          totalQuantity: 50,
          concertId: '2',
          createdAt: '2024-01-02T00:00:00.000Z',
        },
      ],
      createdAt: '2024-01-02T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseConcertSSE.mockReturnValue(undefined);
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
      mockUseConcerts.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
        isError: false,
        isSuccess: false,
      } as any);

      renderWithRouter(<ConcertCatalogPage />);

      expect(screen.getByText('Loading concerts...')).toBeInTheDocument();
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should center loading content', () => {
      mockUseConcerts.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      renderWithRouter(<ConcertCatalogPage />);

      const container = screen.getByText('Loading concerts...').closest('.min-h-screen');
      expect(container).toHaveClass('flex', 'items-center', 'justify-center');
    });
  });

  describe('error state', () => {
    it('should render error message when error occurs', () => {
      mockUseConcerts.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
        isError: true,
      } as any);

      renderWithRouter(<ConcertCatalogPage />);

      expect(screen.getByText('Failed to load concerts')).toBeInTheDocument();
      expect(screen.getByText('Please try again later')).toBeInTheDocument();
    });

    it('should render error icon', () => {
      mockUseConcerts.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
        isError: true,
      } as any);

      renderWithRouter(<ConcertCatalogPage />);

      const errorContainer = screen.getByText('Failed to load concerts').parentElement;
      expect(errorContainer).toHaveClass('text-red-600');
    });
  });

  describe('success state with concerts', () => {
    beforeEach(() => {
      mockUseConcerts.mockReturnValue({
        data: mockConcerts,
        isLoading: false,
        error: null,
        isSuccess: true,
      } as any);
    });

    it('should render page header with title', () => {
      renderWithRouter(<ConcertCatalogPage />);

      expect(screen.getByText('Concert Catalog')).toBeInTheDocument();
      expect(screen.getByText('Book your tickets for upcoming concerts')).toBeInTheDocument();
    });

    it('should render ThemeToggle component', () => {
      renderWithRouter(<ConcertCatalogPage />);

      const themeToggle = screen.getByRole('button', { name: /switch to/i });
      expect(themeToggle).toBeInTheDocument();
    });

    it('should render Analytics navigation link', () => {
      renderWithRouter(<ConcertCatalogPage />);

      const analyticsLink = screen.getByRole('link', { name: /analytics/i });
      expect(analyticsLink).toBeInTheDocument();
      expect(analyticsLink).toHaveAttribute('href', '/analytics');
    });

    it('should render all concert cards', () => {
      renderWithRouter(<ConcertCatalogPage />);

      expect(screen.getByTestId('concert-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('concert-card-2')).toBeInTheDocument();
      expect(screen.getByText('The Beatles Reunion')).toBeInTheDocument();
      expect(screen.getByText('Led Zeppelin Live')).toBeInTheDocument();
    });

    it('should render concert cards in grid layout', () => {
      renderWithRouter(<ConcertCatalogPage />);

      const grid = screen.getByTestId('concert-card-1').parentElement;
      expect(grid).toHaveClass('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
    });

    it('should render correct number of concert cards', () => {
      renderWithRouter(<ConcertCatalogPage />);

      const concertCards = screen.getAllByTestId(/concert-card-/);
      expect(concertCards).toHaveLength(2);
    });
  });

  describe('empty state', () => {
    it('should render empty state when no concerts available', () => {
      mockUseConcerts.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        isSuccess: true,
      } as any);

      renderWithRouter(<ConcertCatalogPage />);

      expect(screen.getByText('No concerts available')).toBeInTheDocument();
      expect(screen.getByText('Check back later for upcoming events')).toBeInTheDocument();
    });

    it('should render music icon in empty state', () => {
      mockUseConcerts.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        isSuccess: true,
      } as any);

      const { container } = renderWithRouter(<ConcertCatalogPage />);

      const emptyStateIcon = container.querySelector('svg.text-gray-400');
      expect(emptyStateIcon).toBeInTheDocument();
    });

    it('should still render header in empty state', () => {
      mockUseConcerts.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        isSuccess: true,
      } as any);

      renderWithRouter(<ConcertCatalogPage />);

      expect(screen.getByText('Concert Catalog')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /analytics/i })).toBeInTheDocument();
    });
  });

  describe('SSE integration', () => {
    it('should call useConcertSSE hook on mount', () => {
      mockUseConcerts.mockReturnValue({
        data: mockConcerts,
        isLoading: false,
        error: null,
      } as any);

      renderWithRouter(<ConcertCatalogPage />);

      expect(mockUseConcertSSE).toHaveBeenCalledTimes(1);
    });

    it('should call useConcertSSE even when loading', () => {
      mockUseConcerts.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      renderWithRouter(<ConcertCatalogPage />);

      expect(mockUseConcertSSE).toHaveBeenCalledTimes(1);
    });

    it('should call useConcertSSE even on error', () => {
      mockUseConcerts.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed'),
      } as any);

      renderWithRouter(<ConcertCatalogPage />);

      expect(mockUseConcertSSE).toHaveBeenCalledTimes(1);
    });
  });

  describe('responsive design', () => {
    beforeEach(() => {
      mockUseConcerts.mockReturnValue({
        data: mockConcerts,
        isLoading: false,
        error: null,
      } as any);
    });

    it('should have responsive header padding', () => {
      renderWithRouter(<ConcertCatalogPage />);

      const header = screen.getByRole('banner');
      const headerContent = header.querySelector('.max-w-7xl');
      expect(headerContent).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
    });

    it('should have responsive main content padding', () => {
      renderWithRouter(<ConcertCatalogPage />);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
    });

    it('should have responsive grid columns', () => {
      renderWithRouter(<ConcertCatalogPage />);

      const grid = screen.getByTestId('concert-card-1').parentElement;
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
    });
  });

  describe('layout structure', () => {
    beforeEach(() => {
      mockUseConcerts.mockReturnValue({
        data: mockConcerts,
        isLoading: false,
        error: null,
      } as any);
    });

    it('should have min-h-screen on main container', () => {
      const { container } = renderWithRouter(<ConcertCatalogPage />);

      const mainContainer = container.querySelector('.min-h-screen.bg-gray-50');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should have header with shadow', () => {
      renderWithRouter(<ConcertCatalogPage />);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('shadow-sm');
    });

    it('should have max-width constraint on content', () => {
      renderWithRouter(<ConcertCatalogPage />);

      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveClass('max-w-7xl', 'mx-auto');
    });
  });
});
