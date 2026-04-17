import { FirestoreUserRepository } from '../../infrastructure/database/FirestoreUserRepository';

// Mock firebase-admin
const mockGet = jest.fn();
const mockSet = jest.fn();
const mockWhere = jest.fn();
const mockLimit = jest.fn();
const mockDoc = jest.fn();
const mockCollection = jest.fn();

jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
  firestore: jest.fn(() => ({
    collection: mockCollection,
  })),
}));

jest.mock('../../infrastructure/services/FirebaseService', () => ({
  getFirestore: jest.fn(() => ({
    collection: mockCollection,
  })),
}));

describe('FirestoreUserRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('returns null when user not found', async () => {
      mockGet.mockResolvedValue({ empty: true, docs: [] });
      mockLimit.mockReturnValue({ get: mockGet });
      mockWhere.mockReturnValue({ limit: mockLimit });
      mockCollection.mockReturnValue({ where: mockWhere });

      const repo = new FirestoreUserRepository();
      const result = await repo.findByEmail('notfound@example.com');

      expect(result).toBeNull();
      expect(mockWhere).toHaveBeenCalledWith('email', '==', 'notfound@example.com');
    });

    it('returns user when found', async () => {
      const mockDoc = {
        id: 'user-123',
        data: () => ({ email: 'found@example.com' }),
      };
      mockGet.mockResolvedValue({ empty: false, docs: [mockDoc] });
      mockLimit.mockReturnValue({ get: mockGet });
      mockWhere.mockReturnValue({ limit: mockLimit });
      mockCollection.mockReturnValue({ where: mockWhere });

      const repo = new FirestoreUserRepository();
      const result = await repo.findByEmail('found@example.com');

      expect(result).toEqual({ id: 'user-123', email: 'found@example.com' });
    });
  });

  describe('create', () => {
    it('creates and returns a new user with generated id', async () => {
      mockSet.mockResolvedValue(undefined);
      const mockDocRef = { set: mockSet };
      mockDoc.mockReturnValue(mockDocRef);
      mockCollection.mockReturnValue({ doc: mockDoc });

      const repo = new FirestoreUserRepository();
      const result = await repo.create({ email: 'new@example.com' });

      expect(result.email).toBe('new@example.com');
      expect(typeof result.id).toBe('string');
      expect(result.id.length).toBeGreaterThan(0);
    });
  });
});
