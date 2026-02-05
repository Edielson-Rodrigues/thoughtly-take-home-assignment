import { TicketTierRepository } from '../ticket-tier.repository';

describe('Database -> Ticket Tier Repository - Increase Stock', () => {
  const repositoryMock = {
    update: jest.fn().mockResolvedValue(undefined),
  };

  const dataSourceMock = {
    getRepository: jest.fn().mockReturnValue(repositoryMock),
  };

  let ticketTierRepository: TicketTierRepository;

  beforeAll(() => {
    ticketTierRepository = new TicketTierRepository(dataSourceMock as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('SUCCESS CASES', () => {
    it('should increase stock for the given ticket tier', async () => {
      const id = 'ticket-tier-id';
      const quantity = 5;

      await ticketTierRepository.increaseStock(id, quantity);

      expect(repositoryMock.update).toHaveBeenCalledTimes(1);
      expect(repositoryMock.update).toHaveBeenCalledWith(id, {
        availableQuantity: expect.any(Function),
      });
    });
  });
});
