// In-memory data store for demo purposes
let users = [
  {
    id: 1,
    email: 'admin@example.com',
    password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    display_name: 'Admin User',
    is_admin: true,
    is_verified: true,
    created_at: new Date()
  },
  {
    id: 2,
    email: 'john@example.com',
    password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    display_name: 'John Doe',
    is_admin: false,
    is_verified: true,
    created_at: new Date()
  },
  {
    id: 3,
    email: 'jane@example.com',
    password_hash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    display_name: 'Jane Smith',
    is_admin: false,
    is_verified: true,
    created_at: new Date()
  }
];

let competitions = [
  {
    id: 1,
    title: 'Ultimate Office Snack Championship',
    topic: 'The definitive battle to crown the supreme office snack. From healthy options to guilty pleasures - which snack will reign supreme?',
    host_id: 1,
    status: 'voting',
    entry_deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
    voting_start: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    bracket_size: 16,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 2,
    title: 'Best Coffee Shop',
    topic: 'Which coffee shop serves the best brew in town?',
    host_id: 2,
    status: 'accepting_entries',
    entry_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: 3,
    title: 'Greatest Movie of All Time',
    topic: 'The ultimate cinematic showdown',
    host_id: 2,
    status: 'completed',
    winner_id: 3,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  }
];

let entries = [
  // Competition 1: Ultimate Office Snack Championship (16 entries)
  { id: 1, competition_id: 1, user_id: 1, selection: 'Dark Chocolate', image_url: 'https://via.placeholder.com/150x100/8B4513/FFFFFF?text=Dark+Chocolate', bracket_position: 1 },
  { id: 2, competition_id: 1, user_id: 2, selection: 'Mixed Nuts', image_url: 'https://via.placeholder.com/150x100/DEB887/000000?text=Mixed+Nuts', bracket_position: 2 },
  { id: 3, competition_id: 1, user_id: 3, selection: 'Apple Slices', image_url: 'https://via.placeholder.com/150x100/FF6347/FFFFFF?text=Apple+Slices', bracket_position: 3 },
  { id: 4, competition_id: 1, user_id: 1, selection: 'Granola Bar', image_url: 'https://via.placeholder.com/150x100/D2691E/FFFFFF?text=Granola+Bar', bracket_position: 4 },
  { id: 5, competition_id: 1, user_id: 2, selection: 'Potato Chips', image_url: 'https://via.placeholder.com/150x100/FFD700/000000?text=Potato+Chips', bracket_position: 5 },
  { id: 6, competition_id: 1, user_id: 3, selection: 'Yogurt', image_url: 'https://via.placeholder.com/150x100/FFF8DC/000000?text=Yogurt', bracket_position: 6 },
  { id: 7, competition_id: 1, user_id: 1, selection: 'Cookies', image_url: 'https://via.placeholder.com/150x100/CD853F/FFFFFF?text=Cookies', bracket_position: 7 },
  { id: 8, competition_id: 1, user_id: 2, selection: 'Trail Mix', image_url: 'https://via.placeholder.com/150x100/8FBC8F/000000?text=Trail+Mix', bracket_position: 8 },
  { id: 9, competition_id: 1, user_id: 3, selection: 'Pretzels', image_url: 'https://via.placeholder.com/150x100/DEB887/000000?text=Pretzels', bracket_position: 9 },
  { id: 10, competition_id: 1, user_id: null, selection: 'Energy Bar', image_url: 'https://via.placeholder.com/150x100/32CD32/FFFFFF?text=Energy+Bar', bracket_position: 10, is_ai_generated: true },
  { id: 11, competition_id: 1, user_id: null, selection: 'Crackers', image_url: 'https://via.placeholder.com/150x100/F5DEB3/000000?text=Crackers', bracket_position: 11, is_ai_generated: true },
  { id: 12, competition_id: 1, user_id: null, selection: 'Fruit Gummies', image_url: 'https://via.placeholder.com/150x100/FF69B4/FFFFFF?text=Fruit+Gummies', bracket_position: 12, is_ai_generated: true },
  { id: 13, competition_id: 1, user_id: null, selection: 'Popcorn', image_url: 'https://via.placeholder.com/150x100/FFFFE0/000000?text=Popcorn', bracket_position: 13, is_ai_generated: true },
  { id: 14, competition_id: 1, user_id: null, selection: 'Cheese Sticks', image_url: 'https://via.placeholder.com/150x100/FFA500/000000?text=Cheese+Sticks', bracket_position: 14, is_ai_generated: true },
  { id: 15, competition_id: 1, user_id: null, selection: 'Banana', image_url: 'https://via.placeholder.com/150x100/FFFF00/000000?text=Banana', bracket_position: 15, is_ai_generated: true },
  { id: 16, competition_id: 1, user_id: null, selection: 'Protein Bar', image_url: 'https://via.placeholder.com/150x100/8B0000/FFFFFF?text=Protein+Bar', bracket_position: 16, is_ai_generated: true },

  // Competition 2: Best Coffee Shop (accepting entries)
  { id: 17, competition_id: 2, user_id: 1, selection: 'Starbucks', image_url: 'https://via.placeholder.com/150x100/00704A/FFFFFF?text=Starbucks' },
  { id: 18, competition_id: 2, user_id: 2, selection: 'Local Roasters', image_url: 'https://via.placeholder.com/150x100/8B4513/FFFFFF?text=Local+Roasters' },

  // Competition 3: Greatest Movie (completed)
  { id: 19, competition_id: 3, user_id: 3, selection: 'The Godfather', image_url: 'https://via.placeholder.com/150x100/000000/FFFFFF?text=The+Godfather' },
  { id: 20, competition_id: 3, user_id: 1, selection: 'Pulp Fiction', image_url: 'https://via.placeholder.com/150x100/8B0000/FFFFFF?text=Pulp+Fiction' }
];

let userStats = [
  { id: 1, user_id: 1, total_competitions: 2, total_wins: 0, total_votes_cast: 5, times_hosted: 1, win_rate: 0.00 },
  { id: 2, user_id: 2, total_competitions: 2, total_wins: 0, total_votes_cast: 4, times_hosted: 1, win_rate: 0.00 },
  { id: 3, user_id: 3, total_competitions: 2, total_wins: 1, total_votes_cast: 3, times_hosted: 0, win_rate: 50.00 }
];

let matches = [
  // Round 1 (Round of 16) - 8 matches
  { id: 1, competition_id: 1, round_number: 1, match_number: 1, entry1_id: 1, entry2_id: 16, entry1_votes: 0, entry2_votes: 0, total_votes: 2, status: 'voting', created_at: new Date() },
  { id: 2, competition_id: 1, round_number: 1, match_number: 2, entry1_id: 2, entry2_id: 15, entry1_votes: 0, entry2_votes: 0, total_votes: 3, status: 'voting', created_at: new Date() },
  { id: 3, competition_id: 1, round_number: 1, match_number: 3, entry1_id: 3, entry2_id: 14, entry1_votes: 0, entry2_votes: 0, total_votes: 2, status: 'voting', created_at: new Date() },
  { id: 4, competition_id: 1, round_number: 1, match_number: 4, entry1_id: 4, entry2_id: 13, entry1_votes: 0, entry2_votes: 0, total_votes: 3, status: 'voting', created_at: new Date() },
  { id: 5, competition_id: 1, round_number: 1, match_number: 5, entry1_id: 5, entry2_id: 12, entry1_votes: 0, entry2_votes: 0, total_votes: 2, status: 'voting', created_at: new Date() },
  { id: 6, competition_id: 1, round_number: 1, match_number: 6, entry1_id: 6, entry2_id: 11, entry1_votes: 0, entry2_votes: 0, total_votes: 3, status: 'voting', created_at: new Date() },
  { id: 7, competition_id: 1, round_number: 1, match_number: 7, entry1_id: 7, entry2_id: 10, entry1_votes: 0, entry2_votes: 0, total_votes: 1, status: 'voting', created_at: new Date() },
  { id: 8, competition_id: 1, round_number: 1, match_number: 8, entry1_id: 8, entry2_id: 9, entry1_votes: 0, entry2_votes: 0, total_votes: 2, status: 'voting', created_at: new Date() },

  // Round 2 (Quarterfinals) - 4 matches (pending)
  { id: 9, competition_id: 1, round_number: 2, match_number: 1, entry1_id: null, entry2_id: null, entry1_votes: 0, entry2_votes: 0, total_votes: 0, status: 'pending', created_at: new Date() },
  { id: 10, competition_id: 1, round_number: 2, match_number: 2, entry1_id: null, entry2_id: null, entry1_votes: 0, entry2_votes: 0, total_votes: 0, status: 'pending', created_at: new Date() },
  { id: 11, competition_id: 1, round_number: 2, match_number: 3, entry1_id: null, entry2_id: null, entry1_votes: 0, entry2_votes: 0, total_votes: 0, status: 'pending', created_at: new Date() },
  { id: 12, competition_id: 1, round_number: 2, match_number: 4, entry1_id: null, entry2_id: null, entry1_votes: 0, entry2_votes: 0, total_votes: 0, status: 'pending', created_at: new Date() },

  // Round 3 (Semifinals) - 2 matches (pending)
  { id: 13, competition_id: 1, round_number: 3, match_number: 1, entry1_id: null, entry2_id: null, entry1_votes: 0, entry2_votes: 0, total_votes: 0, status: 'pending', created_at: new Date() },
  { id: 14, competition_id: 1, round_number: 3, match_number: 2, entry1_id: null, entry2_id: null, entry1_votes: 0, entry2_votes: 0, total_votes: 0, status: 'pending', created_at: new Date() },

  // Round 4 (Final) - 1 match (pending)
  { id: 15, competition_id: 1, round_number: 4, match_number: 1, entry1_id: null, entry2_id: null, entry1_votes: 0, entry2_votes: 0, total_votes: 0, status: 'pending', created_at: new Date() }
];

let votes = [
  { id: 1, match_id: 1, user_id: 1, entry_id: 1, created_at: new Date() }, // Admin voted for Coke
  { id: 2, match_id: 1, user_id: 3, entry_id: 1, created_at: new Date() }, // Jane voted for Coke
  { id: 3, match_id: 1, user_id: 2, entry_id: 2, created_at: new Date() }, // John voted for Pepsi
  { id: 4, match_id: 2, user_id: 2, entry_id: 4, created_at: new Date() }, // John voted for Sprite
  { id: 5, match_id: 2, user_id: 3, entry_id: 4, created_at: new Date() }, // Jane voted for Sprite
  { id: 6, match_id: 2, user_id: 1, entry_id: 3, created_at: new Date() }  // Admin voted for Dr Pepper
];
let notifications = [];

// Helper functions
const getNextId = (array) => Math.max(...array.map(item => item.id), 0) + 1;

const findUser = (criteria) => users.find(user => {
  return Object.keys(criteria).every(key => user[key] === criteria[key]);
});

const findUsers = (criteria = {}) => users.filter(user => {
  return Object.keys(criteria).every(key => user[key] === criteria[key]);
});

const createUser = (userData) => {
  const newUser = {
    id: getNextId(users),
    created_at: new Date(),
    updated_at: new Date(),
    is_admin: false,
    is_verified: true,
    auth_provider: 'local',
    ...userData
  };
  users.push(newUser);

  // Create user stats
  userStats.push({
    id: getNextId(userStats),
    user_id: newUser.id,
    total_competitions: 0,
    total_wins: 0,
    total_votes_cast: 0,
    times_hosted: 0,
    win_rate: 0.00
  });

  return newUser;
};

const findCompetition = (id) => competitions.find(comp => comp.id === parseInt(id));

const findCompetitions = (criteria = {}) => competitions.filter(comp => {
  return Object.keys(criteria).every(key => comp[key] === criteria[key]);
});

const createEntry = (entryData) => {
  const newEntry = {
    id: getNextId(entries),
    created_at: new Date(),
    ...entryData
  };
  entries.push(newEntry);
  return newEntry;
};

const findEntries = (criteria = {}) => entries.filter(entry => {
  return Object.keys(criteria).every(key => entry[key] === criteria[key]);
});

const getUserStats = (userId) => userStats.find(stats => stats.user_id === userId);

const createCompetition = (competitionData) => {
  const newCompetition = {
    id: getNextId(competitions),
    created_at: new Date(),
    updated_at: new Date(),
    status: 'accepting_entries',
    ...competitionData
  };
  competitions.push(newCompetition);
  return newCompetition;
};

const findMatches = (criteria = {}) => matches.filter(match => {
  return Object.keys(criteria).every(key => match[key] === criteria[key]);
});

const findVotes = (criteria = {}) => votes.filter(vote => {
  return Object.keys(criteria).every(key => vote[key] === criteria[key]);
});

module.exports = {
  users,
  competitions,
  entries,
  userStats,
  matches,
  votes,
  notifications,
  findUser,
  findUsers,
  createUser,
  findCompetition,
  findCompetitions,
  createCompetition,
  createEntry,
  findEntries,
  findMatches,
  findVotes,
  getUserStats,
  getNextId
};