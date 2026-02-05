import { Card, CardHeader, CardContent, Badge } from '../../../components/ui';
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

export function ConcertCard({ concert }: ConcertCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="bg-linear-to-r from-blue-600 to-indigo-600">
        <h3 className="text-lg font-semibold text-white truncate">{concert.name}</h3>
        <p className="text-blue-100 text-sm mt-1">{concert.location}</p>
      </CardHeader>

      <CardContent>
        <div className="mb-4">
          <div className="flex items-center text-gray-600 text-sm mb-2">
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
          <p className="text-gray-600 text-sm line-clamp-2">{concert.description}</p>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Ticket Tiers</h4>
          <div className="space-y-2">
            {concert.ticketTiers?.map((tier) => (
              <div
                key={tier.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{tier.name}</span>
                  <span className="ml-2 text-blue-600 font-semibold">
                    {formatPrice(tier.price)}
                  </span>
                </div>
                <Badge variant={getAvailabilityVariant(tier)}>
                  {tier.availableQuantity > 0
                    ? `${tier.availableQuantity} left`
                    : 'Sold Out'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
