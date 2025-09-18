const { Pool } = require('pg');

// Test database configuration
const testPool = new Pool({
  host: process.env.TEST_DB_HOST || 'localhost',
  port: process.env.TEST_DB_PORT || 5432,
  database: process.env.TEST_DB_NAME || 'world_cup_wednesdays_test',
  user: process.env.TEST_DB_USER || process.env.DB_USER,
  password: process.env.TEST_DB_PASSWORD || process.env.DB_PASSWORD,
});

// Setup test database
beforeAll(async () => {
  // Create test tables
  await testPool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255),
      display_name VARCHAR(100) NOT NULL,
      avatar_url VARCHAR(500),
      auth_provider VARCHAR(50) DEFAULT 'local',
      provider_id VARCHAR(255),
      is_verified BOOLEAN DEFAULT false,
      is_admin BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await testPool.query(`
    CREATE TABLE IF NOT EXISTS competitions (
      id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      topic VARCHAR(500) NOT NULL,
      host_id INTEGER REFERENCES users(id),
      status VARCHAR(50) DEFAULT 'upcoming',
      entry_deadline TIMESTAMP,
      voting_start TIMESTAMP,
      final_date TIMESTAMP,
      winner_id INTEGER REFERENCES users(id),
      winner_entry_id INTEGER,
      bracket_size INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await testPool.query(`
    CREATE TABLE IF NOT EXISTS user_stats (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) UNIQUE,
      total_competitions INTEGER DEFAULT 0,
      total_wins INTEGER DEFAULT 0,
      total_votes_cast INTEGER DEFAULT 0,
      times_hosted INTEGER DEFAULT 0,
      win_rate DECIMAL(5,2) DEFAULT 0.00,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
});

// Clean up after each test
afterEach(async () => {
  await testPool.query('DELETE FROM competitions');
  await testPool.query('DELETE FROM user_stats');
  await testPool.query('DELETE FROM users');
});

// Close connection after all tests
afterAll(async () => {
  await testPool.end();
});

module.exports = testPool;