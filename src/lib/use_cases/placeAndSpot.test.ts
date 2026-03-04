import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlaceAndSpotUseCase } from './placeAndSpot';
import type { PersistenceRepository } from '$lib/ports/persistence.repository';

// Mock the DTO transformer so use case tests don't depend on its internals
vi.mock('$lib/adapters/secondary/appwrite/dtos/appwriteToUserSpotRecord', () => ({
  transformAppwriteToUserSpotRecord: (doc: any) => ({ id: doc.$id, ...doc }),
}));

const mockRow = {
  $id: 'spot-1',
  personal_rating: null,
  personal_notes: null,
  is_visited: false,
  user_id: 'user-1',
  social_links: [],
  place_id: { $id: 'place-1', name: 'Test' },
};

function makeMockRepo(overrides: Partial<PersistenceRepository> = {}): PersistenceRepository {
  return {
    saveMasterPlace: vi.fn(),
    saveUserSpot: vi.fn(),
    savePlaceAndSpot: vi.fn().mockResolvedValue({ success: true }),
    getMasterPlace: vi.fn(),
    getUserSpot: vi.fn().mockResolvedValue(mockRow),
    getUserSpots: vi.fn().mockResolvedValue({ total: 1, rows: [mockRow] }),
    getMasterPlaces: vi.fn().mockResolvedValue([]),
    hasMasterPlace: vi.fn(),
    hasUserSpot: vi.fn(),
    updateUserSpot: vi.fn().mockResolvedValue(mockRow),
    deleteUserSpot: vi.fn().mockResolvedValue({ success: true }),
    ...overrides,
  };
}

describe('PlaceAndSpotUseCase', () => {
  let repo: PersistenceRepository;
  let useCase: PlaceAndSpotUseCase;

  beforeEach(() => {
    repo = makeMockRepo();
    useCase = new PlaceAndSpotUseCase(repo);
  });

  describe('getSpots', () => {
    it('calls getUserSpots with the given userId', async () => {
      await useCase.getSpots('user-1');
      expect(repo.getUserSpots).toHaveBeenCalledWith('user-1');
    });

    it('returns total and a mapped rows array', async () => {
      const result = await useCase.getSpots('user-1');
      expect(result.total).toBe(1);
      expect(result.rows).toHaveLength(1);
    });
  });

  describe('getSpotByPlaceId', () => {
    it('returns null when repository returns null', async () => {
      repo = makeMockRepo({ getUserSpot: vi.fn().mockResolvedValue(null) });
      useCase = new PlaceAndSpotUseCase(repo);
      const result = await useCase.getSpotByPlaceId('place-1', 'user-1');
      expect(result).toBeNull();
    });

    it('returns transformed spot with rowId attached', async () => {
      const result = await useCase.getSpotByPlaceId('place-1', 'user-1');
      expect(result).not.toBeNull();
      expect(result!.rowId).toBe('spot-1');
    });

    it('calls getUserSpot with placeId and userId', async () => {
      await useCase.getSpotByPlaceId('place-123', 'user-456');
      expect(repo.getUserSpot).toHaveBeenCalledWith('place-123', 'user-456');
    });
  });

  describe('updateSpot', () => {
    it('calls updateUserSpot with rowId and data', async () => {
      await useCase.updateSpot('row-1', { personal_notes: 'Great!' });
      expect(repo.updateUserSpot).toHaveBeenCalledWith('row-1', { personal_notes: 'Great!' });
    });

    it('returns transformed spot with rowId', async () => {
      const result = await useCase.updateSpot('row-1', {});
      expect(result.rowId).toBe('spot-1');
    });
  });

  describe('getAllMasterPlaces', () => {
    it('delegates to repository getMasterPlaces', async () => {
      await useCase.getAllMasterPlaces();
      expect(repo.getMasterPlaces).toHaveBeenCalled();
    });
  });

  describe('upsert', () => {
    it('calls savePlaceAndSpot with place and userId', async () => {
      const place = { id: 'p1', place_id: 'ChIJ', name: 'Place', address: '', websiteURI: '', price_level: 'free', lat: 0, lng: 0, photos: [], neighborhood: '', areas: [], place_types: [] } as any;
      await useCase.upsert(place, 'user-1');
      expect(repo.savePlaceAndSpot).toHaveBeenCalledWith(place, 'user-1');
    });
  });

  describe('deleteSpot', () => {
    it('calls deleteUserSpot with the rowId', async () => {
      await useCase.deleteSpot('row-99');
      expect(repo.deleteUserSpot).toHaveBeenCalledWith('row-99');
    });
  });
});
