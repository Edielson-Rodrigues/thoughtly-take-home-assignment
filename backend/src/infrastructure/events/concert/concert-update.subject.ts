import { Subject } from 'rxjs';

export type ConcertStockUpdate = {
  concertId: string;
  ticketTierId: string;
  newAvailableQuantity: number;
};

/**
 * CONCERT UPDATE SUBJECT (Singleton)
 *
 * Acts as the centralized "Event Bus" for real-time stock updates.
 *
 * Pattern:
 * 1. BookingsService calls .next() when a ticket is sold.
 * 2. ConcertController subscribes to .asObservable() for SSE clients.
 * 3. Uses RxJS Subject to multicast the same message to all listeners.
 */
export class ConcertUpdateSubject extends Subject<ConcertStockUpdate> {
  private static instance: ConcertUpdateSubject;

  private constructor() {
    super();
  }

  /**
   * Returns the single shared instance of the subject.
   * Ensures all parts of the app talk to the same stream.
   */
  public static getInstance(): ConcertUpdateSubject {
    if (!ConcertUpdateSubject.instance) {
      ConcertUpdateSubject.instance = new ConcertUpdateSubject();
    }
    return ConcertUpdateSubject.instance;
  }
}
