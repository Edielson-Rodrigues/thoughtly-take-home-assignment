import { FindOptionsWhere } from 'typeorm';

import { TicketTierMock } from '@domain/entities/ticket-tier/__mocks__/ticket-tier.mock';
import { TicketTierEntity } from '@domain/entities/ticket-tier/ticket-tier.entity';
import { TicketTierRelations } from '@domain/entities/ticket-tier/ticket-tier.interface';

import { TicketTierRepository } from '../ticket-tier.repository';

describe('Database -> Ticket Tier Repository - Find One', () => {
  const ticketTierMock = new TicketTierMock();

  const mockRepository = {
    findOne: jest.fn().mockResolvedValue(ticketTierMock),
  };

  const mockDataSource = {
    getRepository: jest.fn().mockReturnValue(mockRepository),
  };

  let ticketTierRepository: TicketTierRepository;

  beforeAll(() => {
    ticketTierRepository = new TicketTierRepository(mockDataSource as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('SUCCESS CASES', () => {
    it('should return ticket tier when found', async () => {
      const filters: FindOptionsWhere<TicketTierEntity> = { id: ticketTierMock.id };
      const relations: TicketTierRelations = { concert: true, bookings: false };

      const result = await ticketTierRepository.findOne(filters, relations);

      expect(result).toStrictEqual(ticketTierMock);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: filters,
        relations: relations,
      });
    });

    it('should find ticket tier without relations', async () => {
      const filters: FindOptionsWhere<TicketTierEntity> = {
        concertId: ticketTierMock.concertId,
      };

      const result = await ticketTierRepository.findOne(filters);

      expect(result).toStrictEqual(ticketTierMock);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: filters,
        relations: undefined,
      });
    });

    it('should return null when ticket tier not found', async () => {
      const filters: FindOptionsWhere<TicketTierEntity> = {
        id: 'non-existent-id',
      };

      mockRepository.findOne.mockResolvedValueOnce(null);

      const result = await ticketTierRepository.findOne(filters);

      expect(result).toBeNull();
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: filters,
        relations: undefined,
      });
    });
  });
});
