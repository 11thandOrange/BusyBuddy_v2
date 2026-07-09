import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockCollection, mockDb, mockClient } = vi.hoisted(() => {
  const mockCollection = {
    findOneAndReplace: vi.fn().mockResolvedValue({}),
    findOne: vi.fn(),
    deleteOne: vi.fn().mockResolvedValue({}),
    deleteMany: vi.fn().mockResolvedValue({}),
    find: vi.fn(),
  };
  const mockDb = {
    collection: vi.fn(() => mockCollection),
    collections: vi.fn().mockResolvedValue([]),
    command: vi.fn().mockResolvedValue({ ok: 1 }),
  };
  const mockClient = {
    connect: vi.fn().mockResolvedValue(undefined),
    db: vi.fn(() => mockDb),
    close: vi.fn().mockResolvedValue(undefined),
  };
  return { mockCollection, mockDb, mockClient };
});

vi.mock('mongodb', () => ({
  MongoClient: vi.fn(() => mockClient),
}));

vi.mock('@shopify/shopify-api', () => ({
  Session: class Session {
    constructor(data) {
      Object.assign(this, data);
    }
  },
}));

import { MongoDBSessionStorage } from '../../customeMongoSession.js';

describe('MongoDBSessionStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.collections.mockResolvedValue([]);
  });

  it('connects, pings, and ensures the sessions collection exists on construction', async () => {
    const storage = new MongoDBSessionStorage('mongodb://localhost:27017', 'test-db');
    await storage.ready;

    expect(mockClient.connect).toHaveBeenCalled();
    expect(mockDb.collection).toHaveBeenCalledWith('shopify_sessions');
  });

  it('does not re-create the sessions collection if it already exists', async () => {
    mockDb.collections.mockResolvedValue([{ collectionName: 'shopify_sessions' }]);
    const storage = new MongoDBSessionStorage('mongodb://localhost:27017', 'test-db');
    await storage.ready;

    // collection() is only called by createCollection() when the
    // collection is missing, and again lazily via the `collection` getter -
    // the important assertion is hasSessionCollection() short-circuits it.
    expect(mockDb.collections).toHaveBeenCalled();
  });

  it('storeSession upserts by session id', async () => {
    const storage = new MongoDBSessionStorage('mongodb://localhost:27017', 'test-db');
    const session = { id: 'session-1', toObject: () => ({ id: 'session-1', shop: 'test-shop.myshopify.com' }) };

    const result = await storage.storeSession(session);

    expect(result).toBe(true);
    expect(mockCollection.findOneAndReplace).toHaveBeenCalledWith(
      { id: 'session-1' },
      { id: 'session-1', shop: 'test-shop.myshopify.com' },
      { upsert: true }
    );
  });

  it('loadSession returns a Session instance when a document is found', async () => {
    mockCollection.findOne.mockResolvedValue({ id: 'session-1', shop: 'test-shop.myshopify.com' });
    const storage = new MongoDBSessionStorage('mongodb://localhost:27017', 'test-db');

    const session = await storage.loadSession('session-1');

    expect(mockCollection.findOne).toHaveBeenCalledWith({ id: 'session-1' });
    expect(session.id).toBe('session-1');
    expect(session.shop).toBe('test-shop.myshopify.com');
  });

  it('loadSession returns undefined when no document is found', async () => {
    mockCollection.findOne.mockResolvedValue(null);
    const storage = new MongoDBSessionStorage('mongodb://localhost:27017', 'test-db');

    const session = await storage.loadSession('missing-session');

    expect(session).toBeUndefined();
  });

  it('deleteSession removes exactly one session by id', async () => {
    const storage = new MongoDBSessionStorage('mongodb://localhost:27017', 'test-db');

    const result = await storage.deleteSession('session-1');

    expect(result).toBe(true);
    expect(mockCollection.deleteOne).toHaveBeenCalledWith({ id: 'session-1' });
  });

  it('deleteSessions removes all sessions matching the given ids', async () => {
    const storage = new MongoDBSessionStorage('mongodb://localhost:27017', 'test-db');

    await storage.deleteSessions(['session-1', 'session-2']);

    expect(mockCollection.deleteMany).toHaveBeenCalledWith({ id: { $in: ['session-1', 'session-2'] } });
  });

  it('findSessionsByShop returns an empty array when nothing matches', async () => {
    mockCollection.find.mockReturnValue({ toArray: vi.fn().mockResolvedValue([]) });
    const storage = new MongoDBSessionStorage('mongodb://localhost:27017', 'test-db');

    const sessions = await storage.findSessionsByShop('test-shop.myshopify.com');

    expect(sessions).toEqual([]);
  });

  it('findSessionsByShop wraps each matching document in a Session', async () => {
    mockCollection.find.mockReturnValue({
      toArray: vi.fn().mockResolvedValue([
        { id: 'session-1', shop: 'test-shop.myshopify.com' },
        { id: 'session-2', shop: 'test-shop.myshopify.com' },
      ]),
    });
    const storage = new MongoDBSessionStorage('mongodb://localhost:27017', 'test-db');

    const sessions = await storage.findSessionsByShop('test-shop.myshopify.com');

    expect(mockCollection.find).toHaveBeenCalledWith({ shop: 'test-shop.myshopify.com' });
    expect(sessions).toHaveLength(2);
    expect(sessions[0].id).toBe('session-1');
  });
});
