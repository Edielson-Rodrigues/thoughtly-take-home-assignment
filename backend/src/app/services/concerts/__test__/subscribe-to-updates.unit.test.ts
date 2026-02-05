import { of } from 'rxjs';

import { ConcertsService } from '../concerts.service';

describe('Service -> Concerts -> Subscribe To Updates', () => {
  const mockUpdate = {
    concertId: 'concert-123',
    ticketTierId: 'tier-456',
    newAvailableQuantity: 50,
  };

  const expectedSSEFormat = `data: ${JSON.stringify(mockUpdate)}\n\n`;

  const concertRepositoryMock = {
    findAll: jest.fn(),
  };

  const concertUpdateSubjectMock = {
    asObservable: jest.fn().mockReturnValue(of(mockUpdate)),
  };

  let concertsService: ConcertsService;

  beforeAll(() => {
    concertsService = new ConcertsService(concertRepositoryMock as any, concertUpdateSubjectMock as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('SUCCESS CASES', () => {
    it('should return an observable that emits SSE formatted updates', (done) => {
      const observable = concertsService.subscribeToUpdates();

      observable.subscribe({
        next: (value) => {
          expect(value).toBe(expectedSSEFormat);
          expect(concertUpdateSubjectMock.asObservable).toHaveBeenCalledTimes(1);
          done();
        },
        error: done,
      });
    });

    it('should transform update objects to SSE data format', (done) => {
      const anotherUpdate = {
        concertId: 'concert-789',
        ticketTierId: 'tier-101',
        newAvailableQuantity: 25,
      };

      const expectedAnotherSSE = `data: ${JSON.stringify(anotherUpdate)}\n\n`;
      concertUpdateSubjectMock.asObservable.mockReturnValueOnce(of(anotherUpdate));

      const service = new ConcertsService(concertRepositoryMock as any, concertUpdateSubjectMock as any);
      const observable = service.subscribeToUpdates();

      observable.subscribe({
        next: (value) => {
          expect(value).toBe(expectedAnotherSSE);
          done();
        },
        error: done,
      });
    });
  });
});
