-- Seed data for World Cup Wednesdays

-- Insert demo users (password is 'password' for all)
INSERT INTO users (email, password_hash, display_name, is_admin, is_verified) VALUES
('admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', true, true),
('john@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Doe', false, true),
('jane@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane Smith', false, true),
('alice@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Alice Johnson', false, true),
('bob@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bob Wilson', false, true);

-- Initialize user stats
INSERT INTO user_stats (user_id, total_competitions, total_wins, total_votes_cast, times_hosted, win_rate) VALUES
(1, 2, 0, 8, 1, 0.00),
(2, 2, 1, 6, 1, 50.00),
(3, 2, 1, 7, 0, 50.00),
(4, 1, 0, 3, 0, 0.00),
(5, 1, 0, 4, 0, 0.00);

-- Insert demo competitions
INSERT INTO competitions (title, topic, host_id, status, entry_deadline, voting_start, bracket_size) VALUES
('Ultimate Office Snack Championship', 'The definitive battle to crown the supreme office snack. From healthy options to guilty pleasures - which snack will reign supreme?', 1, 'voting', NOW() - INTERVAL '1 day', NOW() - INTERVAL '12 hours', 16),
('Best Coffee Shop in Town', 'Which local coffee shop serves the perfect cup? Submit your favorite spot and let the community decide!', 2, 'accepting_entries', NOW() + INTERVAL '3 days', NULL, NULL),
('Greatest Movie of All Time', 'The ultimate cinematic showdown - which film deserves the crown?', 3, 'completed', NOW() - INTERVAL '14 days', NOW() - INTERVAL '10 days', 8);

-- Insert entries for the snack competition (16 entries)
INSERT INTO entries (competition_id, user_id, selection, image_url, bracket_position, is_ai_generated) VALUES
-- User entries
(1, 1, 'Dark Chocolate', 'https://via.placeholder.com/150x100/8B4513/FFFFFF?text=Dark+Chocolate', 1, false),
(1, 2, 'Mixed Nuts', 'https://via.placeholder.com/150x100/DEB887/000000?text=Mixed+Nuts', 2, false),
(1, 3, 'Apple Slices', 'https://via.placeholder.com/150x100/FF6347/FFFFFF?text=Apple+Slices', 3, false),
(1, 4, 'Granola Bar', 'https://via.placeholder.com/150x100/D2691E/FFFFFF?text=Granola+Bar', 4, false),
(1, 5, 'Potato Chips', 'https://via.placeholder.com/150x100/FFD700/000000?text=Potato+Chips', 5, false),
(1, 1, 'Yogurt', 'https://via.placeholder.com/150x100/FFF8DC/000000?text=Yogurt', 6, false),
(1, 2, 'Cookies', 'https://via.placeholder.com/150x100/CD853F/FFFFFF?text=Cookies', 7, false),
(1, 3, 'Trail Mix', 'https://via.placeholder.com/150x100/8FBC8F/000000?text=Trail+Mix', 8, false),
(1, 4, 'Pretzels', 'https://via.placeholder.com/150x100/DEB887/000000?text=Pretzels', 9, false),
-- AI-generated entries
(1, NULL, 'Energy Bar', 'https://via.placeholder.com/150x100/32CD32/FFFFFF?text=Energy+Bar', 10, true),
(1, NULL, 'Crackers', 'https://via.placeholder.com/150x100/F5DEB3/000000?text=Crackers', 11, true),
(1, NULL, 'Fruit Gummies', 'https://via.placeholder.com/150x100/FF69B4/FFFFFF?text=Fruit+Gummies', 12, true),
(1, NULL, 'Popcorn', 'https://via.placeholder.com/150x100/FFFFE0/000000?text=Popcorn', 13, true),
(1, NULL, 'Cheese Sticks', 'https://via.placeholder.com/150x100/FFA500/000000?text=Cheese+Sticks', 14, true),
(1, NULL, 'Banana', 'https://via.placeholder.com/150x100/FFFF00/000000?text=Banana', 15, true),
(1, NULL, 'Protein Bar', 'https://via.placeholder.com/150x100/8B0000/FFFFFF?text=Protein+Bar', 16, true);

-- Insert entries for coffee shop competition
INSERT INTO entries (competition_id, user_id, selection, image_url, is_ai_generated) VALUES
(2, 1, 'Starbucks Downtown', 'https://via.placeholder.com/150x100/00704A/FFFFFF?text=Starbucks', false),
(2, 2, 'Local Roasters Cafe', 'https://via.placeholder.com/150x100/8B4513/FFFFFF?text=Local+Roasters', false);

-- Insert entries for completed movie competition
INSERT INTO entries (competition_id, user_id, selection, image_url, is_ai_generated) VALUES
(3, 3, 'The Godfather', 'https://via.placeholder.com/150x100/000000/FFFFFF?text=The+Godfather', false),
(3, 1, 'Pulp Fiction', 'https://via.placeholder.com/150x100/8B0000/FFFFFF?text=Pulp+Fiction', false),
(3, 2, 'The Shawshank Redemption', 'https://via.placeholder.com/150x100/4682B4/FFFFFF?text=Shawshank', false),
(3, 4, 'Casablanca', 'https://via.placeholder.com/150x100/2F4F4F/FFFFFF?text=Casablanca', false);

-- Set winner for completed competition
UPDATE competitions SET winner_id = 3, winner_entry_id = (SELECT id FROM entries WHERE competition_id = 3 AND selection = 'The Godfather') WHERE id = 3;

-- Insert tournament matches for the snack competition (Round 1)
INSERT INTO matches (competition_id, round_number, match_number, entry1_id, entry2_id, status, total_votes) VALUES
(1, 1, 1, 1, 16, 'voting', 3),   -- Dark Chocolate vs Protein Bar
(1, 1, 2, 2, 15, 'voting', 4),   -- Mixed Nuts vs Banana
(1, 1, 3, 3, 14, 'voting', 2),   -- Apple Slices vs Cheese Sticks
(1, 1, 4, 4, 13, 'voting', 5),   -- Granola Bar vs Popcorn
(1, 1, 5, 5, 12, 'voting', 3),   -- Potato Chips vs Fruit Gummies
(1, 1, 6, 6, 11, 'voting', 4),   -- Yogurt vs Crackers
(1, 1, 7, 7, 10, 'voting', 2),   -- Cookies vs Energy Bar
(1, 1, 8, 8, 9, 'voting', 3);    -- Trail Mix vs Pretzels

-- Insert placeholder matches for subsequent rounds
INSERT INTO matches (competition_id, round_number, match_number, entry1_id, entry2_id, status) VALUES
-- Quarterfinals
(1, 2, 1, NULL, NULL, 'pending'),
(1, 2, 2, NULL, NULL, 'pending'),
(1, 2, 3, NULL, NULL, 'pending'),
(1, 2, 4, NULL, NULL, 'pending'),
-- Semifinals
(1, 3, 1, NULL, NULL, 'pending'),
(1, 3, 2, NULL, NULL, 'pending'),
-- Final
(1, 4, 1, NULL, NULL, 'pending');

-- Insert some sample votes (distributed across users)
INSERT INTO votes (match_id, user_id, entry_id) VALUES
-- Match 1: Dark Chocolate vs Protein Bar
(1, 1, 1), (1, 2, 1), (1, 3, 16),
-- Match 2: Mixed Nuts vs Banana  
(2, 1, 2), (2, 2, 15), (2, 3, 2), (2, 4, 2),
-- Match 3: Apple Slices vs Cheese Sticks
(3, 1, 3), (3, 2, 14),
-- Match 4: Granola Bar vs Popcorn
(4, 1, 4), (4, 2, 4), (4, 3, 13), (4, 4, 4), (4, 5, 13),
-- Match 5: Potato Chips vs Fruit Gummies
(5, 1, 5), (5, 2, 12), (5, 3, 5),
-- Match 6: Yogurt vs Crackers
(6, 1, 6), (6, 2, 6), (6, 3, 11), (6, 4, 6),
-- Match 7: Cookies vs Energy Bar
(7, 1, 7), (7, 2, 10),
-- Match 8: Trail Mix vs Pretzels
(8, 1, 8), (8, 2, 9), (8, 3, 8);

-- Update match vote counts based on actual votes
UPDATE matches SET 
    entry1_votes = (SELECT COUNT(*) FROM votes WHERE match_id = matches.id AND entry_id = matches.entry1_id),
    entry2_votes = (SELECT COUNT(*) FROM votes WHERE match_id = matches.id AND entry_id = matches.entry2_id),
    total_votes = (SELECT COUNT(*) FROM votes WHERE match_id = matches.id)
WHERE competition_id = 1 AND round_number = 1;

-- Insert host history
INSERT INTO host_history (user_id, competition_id) VALUES
(1, 1),
(2, 2),
(3, 3);