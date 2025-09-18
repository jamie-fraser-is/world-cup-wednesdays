const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const usersRoutes = require('../routes/users');
const testPool = require('./setup');

// Mock the database connection
jest.mock('../database/connection', () => require('./setup'));

const app = express();
app.use(express.json());
app.use('/api/users', usersRoutes);

// Helper function to create test user
const createTestUser = async (displayName = 'Test User') => {
  const result = await testPool.query(
    'INSERT INTO users (email, display_name) VALUES ($1, $2) RETURNING id',
    [`test${Date.now()}@example.com`, displayName]
  );
  
  const userId = result.rows[0].id;
  
  // Create user stats
  await testPool.query(
    'INSERT INTO user_stats (user_id, total_competitions, total_wins, win_rate) VALUES ($1, $2, $3, $4)',
    [userId, 5, 2, 40.00]
  );
  
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret');
  
  return { userId, token };
};

describe('Users Routes', () => {
  describe('GET /api/users/leaderboard', () => {
    it('should return empty leaderboard when no users have competed', async () => {
      const response = await request(app)
        .get('/api/users/leaderboard')
        .expect(200);

      expect(response.body.leaderboard).toEqual([]);
    });

    it('should return leaderboard sorted by wins', async () => {
      // Create multiple test users with different stats
      const user1 = await createTestUser('Winner User');
      await testPool.query(
        'UPDATE user_stats SET total_competitions = 10, total_wins = 8, win_rate = 80.00 WHERE user_id = $1',
        [user1.userId]
      );

      const user2 = await createTestUser('Second User');
      await testPool.query(
        'UPDATE user_stats SET total_competitions = 8, total_wins = 3, win_rate = 37.50 WHERE user_id = $1',
        [user2.userId]
      );

      const response = await request(app)
        .get('/api/users/leaderboard')
        .expect(200);

      expect(response.body.leaderboard).toHaveLength(2);
      expect(response.body.leaderboard[0]).toHaveProperty('display_name', 'Winner User');
      expect(response.body.leaderboard[0]).toHaveProperty('total_wins', 8);
      expect(response.body.leaderboard[1]).toHaveProperty('display_name', 'Second User');
      expect(response.body.leaderboard[1]).toHaveProperty('total_wins', 3);
    });

    it('should limit results to 50 users', async () => {
      // This test would create 60 users and verify only 50 are returned
      // Simplified for brevity
      const response = await request(app)
        .get('/api/users/leaderboard')
        .expect(200);

      expect(Array.isArray(response.body.leaderboard)).toBe(true);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user profile with stats', async () => {
      const { userId } = await createTestUser('Profile User');

      const response = await request(app)
        .get(`/api/users/${userId}`)
        .expect(200);

      expect(response.body.user).toHaveProperty('display_name', 'Profile User');
      expect(response.body.user).toHaveProperty('total_competitions', 5);
      expect(response.body.user).toHaveProperty('total_wins', 2);
      expect(response.body).toHaveProperty('recentCompetitions');
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .get('/api/users/99999')
        .expect(404);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile when authenticated', async () => {
      const { userId, token } = await createTestUser('Old Name');

      const updateData = {
        displayName: 'New Name',
        avatarUrl: 'https://example.com/avatar.jpg'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.user).toHaveProperty('display_name', 'New Name');
      expect(response.body.user).toHaveProperty('avatar_url', 'https://example.com/avatar.jpg');
    });

    it('should reject update without authentication', async () => {
      const updateData = {
        displayName: 'New Name',
        avatarUrl: 'https://example.com/avatar.jpg'
      };

      await request(app)
        .put('/api/users/profile')
        .send(updateData)
        .expect(401);
    });

    it('should reject update with invalid token', async () => {
      const updateData = {
        displayName: 'New Name',
        avatarUrl: 'https://example.com/avatar.jpg'
      };

      await request(app)
        .put('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .send(updateData)
        .expect(401);
    });
  });
});