export interface IBooking {
  id: string;
  userEmail: string;
  quantity: number;
  totalPrice: number;
  tierId: string;
  createdAt: Date;
}

export type CreateBooking = Omit<IBooking, 'id' | 'createdAt'>;
