const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const competitionsRoutes = require('../routes/competitions');
const testPool = require('./setup');

// Mock the database connection
jest.mock('../database/connection', () => require('./setup'));

const app = express();
app.use(express.json());
app.use('/api/competitions', competitionsRoutes);

// Helper function to create test user and get token
const createTestUser = async (isAdmin = false) => {
  const result = await testPool.query(
    'INSERT INTO users (email, display_name, is_admin) VALUES ($1, $2, $3) RETURNING id',
    [`test${Date.now()}@example.com`, 'Test User', isAdmin]
  );
  
  const userId = result.rows[0].id;
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret');
  
  return { userId, token };
};

describe('Competitions Routes', () => {
  describe('GET /api/competitions', () => {
    it('should return empty array when no competitions exist', async () => {
      const response = await request(app)
        .get('/api/competitions')
        .expect(200);

      expect(response.body.competitions).toEqual([]);
    });

    it('should return competitions with host names', async () => {
      // Create test user and competition
      const { userId } = await createTestUser();
      
      await testPool.query(
        'INSERT INTO competitions (title, topic, host_id, status) VALUES ($1, $2, $3, $4)',
        ['Test Competition', 'Best test topic', userId, 'completed']
      );

      const response = await request(app)
        .get('/api/competitions')
        .expect(200);

      expect(response.body.competitions).toHaveLength(1);
      expect(response.body.competitions[0]).toHaveProperty('title', 'Test Competition');
      expect(response.body.competitions[0]).toHaveProperty('host_name', 'Test User');
    });

    it('should filter competitions by status', async () => {
      const { userId } = await createTestUser();
      
      // Create competitions with different statuses
      await testPool.query(
        'INSERT INTO competitions (title, topic, host_id, status) VALUES ($1, $2, $3, $4)',
        ['Active Competition', 'Active topic', userId, 'voting']
      );
      
      await testPool.query(
        'INSERT INTO competitions (title, topic, host_id, status) VALUES ($1, $2, $3, $4)',
        ['Completed Competition', 'Completed topic', userId, 'completed']
      );

      const response = await request(app)
        .get('/api/competitions?status=voting')
        .expect(200);

      expect(response.body.competitions).toHaveLength(1);
      expect(response.body.competitions[0]).toHaveProperty('title', 'Active Competition');
    });
  });

  describe('GET /api/competitions/current', () => {
    it('should return null when no active competition exists', async () => {
      const response = await request(app)
        .get('/api/competitions/current')
        .expect(200);

      expect(response.body.competition).toBeNull();
    });

    it('should return current active competition', async () => {
      const { userId } = await createTestUser();
      
      await testPool.query(
        'INSERT INTO competitions (title, topic, host_id, status) VALUES ($1, $2, $3, $4)',
        ['Current Competition', 'Current topic', userId, 'voting']
      );

      const response = await request(app)
        .get('/api/competitions/current')
        .expect(200);

      expect(response.body.competition).toHaveProperty('title', 'Current Competition');
      expect(response.body.competition).toHaveProperty('status', 'voting');
    });
  });

  describe('POST /api/competitions', () => {
    it('should create competition when user is admin', async () => {
      const { userId, token } = await createTestUser(true);

      const competitionData = {
        title: 'New Competition',
        topic: 'Best new topic',
        hostId: userId,
        entryDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post('/api/competitions')
        .set('Authorization', `Bearer ${token}`)
        .send(competitionData)
        .expect(201);

      expect(response.body.competition).toHaveProperty('title', competitionData.title);
      expect(response.body.competition).toHaveProperty('status', 'accepting_entries');
    });

    it('should reject creation when user is not admin', async () => {
      const { userId, token } = await createTestUser(false);

      const competitionData = {
        title: 'New Competition',
        topic: 'Best new topic',
        hostId: userId,
        entryDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      await request(app)
        .post('/api/competitions')
        .set('Authorization', `Bearer ${token}`)
        .send(competitionData)
        .expect(403);
    });

    it('should reject creation without authentication', async () => {
      const competitionData = {
        title: 'New Competition',
        topic: 'Best new topic',
        hostId: 1,
        entryDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      await request(app)
        .post('/api/competitions')
        .send(competitionData)
        .expect(401);
    });
  });

  describe('GET /api/competitions/:id', () => {
    it('should return competition details', async () => {
      const { userId } = await createTestUser();
      
      const result = await testPool.query(
        'INSERT INTO competitions (title, topic, host_id, status) VALUES ($1, $2, $3, $4) RETURNING id',
        ['Detail Competition', 'Detail topic', userId, 'voting']
      );
      
      const competitionId = result.rows[0].id;

      const response = await request(app)
        .get(`/api/competitions/${competitionId}`)
        .expect(200);

      expect(response.body.competition).toHaveProperty('title', 'Detail Competition');
      expect(response.body).toHaveProperty('entries');
      expect(response.body).toHaveProperty('matches');
    });

    it('should return 404 for non-existent competition', async () => {
      await request(app)
        .get('/api/competitions/99999')
        .expect(404);
    });
  });
});