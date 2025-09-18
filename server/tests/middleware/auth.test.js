const jwt = require('jsonwebtoken');
const { auth, adminAuth } = require('../../middleware/auth');
const testPool = require('../setup');

// Mock the database connection
jest.mock('../../database/connection', () => require('../setup'));

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn(),
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('auth middleware', () => {
    it('should authenticate valid token', async () => {
      // Create test user
      const result = await testPool.query(
        'INSERT INTO users (email, display_name, is_admin) VALUES ($1, $2, $3) RETURNING id',
        ['test@example.com', 'Test User', false]
      );
      const userId = result.rows[0].id;

      const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret');
      req.header.mockReturnValue(`Bearer ${token}`);

      await auth(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(userId);
      expect(req.user.email).toBe('test@example.com');
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject request without token', async () => {
      req.header.mockReturnValue(null);

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid token', async () => {
      req.header.mockReturnValue('Bearer invalid-token');

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject token for non-existent user', async () => {
      const token = jwt.sign({ userId: 99999 }, process.env.JWT_SECRET || 'test-secret');
      req.header.mockReturnValue(`Bearer ${token}`);

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('adminAuth middleware', () => {
    it('should allow admin users', async () => {
      // Create admin user
      const result = await testPool.query(
        'INSERT INTO users (email, display_name, is_admin) VALUES ($1, $2, $3) RETURNING id',
        ['admin@example.com', 'Admin User', true]
      );
      const userId = result.rows[0].id;

      const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret');
      req.header.mockReturnValue(`Bearer ${token}`);

      await adminAuth(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.is_admin).toBe(true);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject non-admin users', async () => {
      // Create regular user
      const result = await testPool.query(
        'INSERT INTO users (email, display_name, is_admin) VALUES ($1, $2, $3) RETURNING id',
        ['user@example.com', 'Regular User', false]
      );
      const userId = result.rows[0].id;

      const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret');
      req.header.mockReturnValue(`Bearer ${token}`);

      await adminAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Admin access required' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject unauthenticated requests', async () => {
      req.header.mockReturnValue(null);

      await adminAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});