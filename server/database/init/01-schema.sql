-- World Cup Wednesdays Database Schema

-- Users table
CREATE TABLE users (
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

-- Competitions table
CREATE TABLE competitions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    topic VARCHAR(500) NOT NULL,
    host_id INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'upcoming', -- upcoming, accepting_entries, voting, final, completed
    entry_deadline TIMESTAMP,
    voting_start TIMESTAMP,
    final_date TIMESTAMP,
    winner_id INTEGER REFERENCES users(id),
    winner_entry_id INTEGER,
    bracket_size INTEGER,
    is_admin_created BOOLEAN DEFAULT false, -- Allows admin to create additional competitions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Round schedules table (host-configured round durations)
CREATE TABLE round_schedules (
    id SERIAL PRIMARY KEY,
    competition_id INTEGER REFERENCES competitions(id),
    round_number INTEGER NOT NULL,
    round_name VARCHAR(100) NOT NULL, -- 'Round of 16', 'Quarterfinals', etc.
    start_time TIMESTAMP,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, active, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(competition_id, round_number)
);

-- Competition entries
CREATE TABLE entries (
    id SERIAL PRIMARY KEY,
    competition_id INTEGER REFERENCES competitions(id),
    user_id INTEGER REFERENCES users(id), -- NULL for AI-generated entries
    selection VARCHAR(200) NOT NULL,
    image_url VARCHAR(500),
    is_ai_generated BOOLEAN DEFAULT false,
    bracket_position INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bracket matches
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    competition_id INTEGER REFERENCES competitions(id),
    round_number INTEGER NOT NULL,
    match_number INTEGER NOT NULL,
    entry1_id INTEGER REFERENCES entries(id),
    entry2_id INTEGER REFERENCES entries(id),
    winner_id INTEGER REFERENCES entries(id),
    total_votes INTEGER DEFAULT 0,
    entry1_votes INTEGER DEFAULT 0,
    entry2_votes INTEGER DEFAULT 0,
    is_tie BOOLEAN DEFAULT false,
    coin_flip_winner INTEGER REFERENCES entries(id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, voting, completed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User votes
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES matches(id),
    user_id INTEGER REFERENCES users(id),
    entry_id INTEGER REFERENCES entries(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(match_id, user_id)
);

-- Host history for rotation
CREATE TABLE host_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    competition_id INTEGER REFERENCES competitions(id),
    hosted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User statistics
CREATE TABLE user_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    total_competitions INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    total_votes_cast INTEGER DEFAULT 0,
    times_hosted INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- host_selected, voting_started, competition_ended, etc.
    title VARCHAR(200) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    competition_id INTEGER REFERENCES competitions(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_competitions_status ON competitions(status);
CREATE INDEX idx_competitions_host ON competitions(host_id);
CREATE INDEX idx_entries_competition ON entries(competition_id);
CREATE INDEX idx_matches_competition ON matches(competition_id);
CREATE INDEX idx_votes_match ON votes(match_id);
CREATE INDEX idx_votes_user ON votes(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_host_history_user ON host_history(user_id);
CREATE INDEX idx_round_schedules_competition ON round_schedules(competition_id);
CREATE INDEX idx_round_schedules_status ON round_schedules(status);
CREATE INDEX idx_competitions_admin_created ON competitions(is_admin_created);