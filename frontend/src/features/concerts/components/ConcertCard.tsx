import { useState } from 'react';

import { Card, CardHeader, CardContent, CardFooter, Badge, Button } from '../../../components/ui';
import { BookingModal } from '../../bookings';
import type { Concert, TicketTier } from '../types';

interface ConcertCardProps {
  concert: Concert;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

function getAvailabilityVariant(tier: TicketTier): 'success' | 'warning' | 'danger' {
  const percentAvailable = (tier.availableQuantity / tier.totalQuantity) * 100;
  if (percentAvailable > 50) return 'success';
  if (percentAvailable > 20) return 'warning';
  return 'danger';
}

interface TicketTierRowProps {
  tier: TicketTier;
}

function TicketTierRow({ tier }: TicketTierRowProps) {
  return (
    <div className="flex items-center justify-between py-2 animate-flash">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-900 dark:text-gray-100">{tier.name}</span>
        <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
          {formatPrice(tier.price)}
        </span>
      </div>
      <Badge variant={getAvailabilityVariant(tier)}>
        {tier.availableQuantity > 0
          ? `${tier.availableQuantity} left`
          : 'Sold Out'}
      </Badge>
    </div>
  );
}

export function ConcertCard({ concert }: ConcertCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasAvailableTickets = concert.ticketTiers?.some(
    (tier) => tier.availableQuantity > 0
  );

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200 flex flex-col">
        <CardHeader className="bg-linear-to-r from-blue-600 to-indigo-600">
          <h3 className="text-lg font-semibold text-white truncate">{concert.name}</h3>
          <p className="text-blue-100 text-sm mt-1">{concert.location}</p>
        </CardHeader>

      <CardContent className="flex-1">
        <div className="mb-4">
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-2">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {formatDate(concert.date)}
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{concert.description}</p>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ticket Tiers</h4>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {concert.ticketTiers
              ?.slice()
              .sort((a, b) => Number(b.price) - Number(a.price))
              .map((tier) => (
                <TicketTierRow
                  key={`${tier.id}-${tier.availableQuantity}`}
                  tier={tier}
                />
              ))}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={() => setIsModalOpen(true)}
          disabled={!hasAvailableTickets}
          className="w-full"
        >
          {hasAvailableTickets ? 'Book Tickets' : 'Sold Out'}
        </Button>
      </CardFooter>
    </Card>

    {isModalOpen && concert.ticketTiers && (
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ticketTiers={concert.ticketTiers}
        concertName={concert.name}
      />
    )}
  </>
  );
}
