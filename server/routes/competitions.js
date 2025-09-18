const express = require('express');
const pool = require('../database/connection');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all competitions
router.get('/', async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        c.*,
        u.display_name as host_name,
        winner.display_name as winner_name,
        COUNT(e.id) as entry_count
      FROM competitions c
      LEFT JOIN users u ON c.host_id = u.id
      LEFT JOIN users winner ON c.winner_id = winner.id
      LEFT JOIN entries e ON c.id = e.competition_id
    `;
    
    const params = [];
    if (status) {
      query += ' WHERE c.status = $1';
      params.push(status);
    }
    
    query += `
      GROUP BY c.id, u.display_name, winner.display_name
      ORDER BY c.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    res.json({ competitions: result.rows });
  } catch (error) {
    console.error('Get competitions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current active competition
router.get('/current', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.*,
        u.display_name as host_name,
        COUNT(e.id) as entry_count
      FROM competitions c
      LEFT JOIN users u ON c.host_id = u.id
      LEFT JOIN entries e ON c.id = e.competition_id
      WHERE c.status IN ('upcoming', 'accepting_entries', 'voting', 'final')
      GROUP BY c.id, u.display_name
      ORDER BY c.created_at DESC
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return res.json({ competition: null });
    }

    res.json({ competition: result.rows[0] });
  } catch (error) {
    console.error('Get current competition error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get competition details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const competitionResult = await pool.query(`
      SELECT 
        c.*,
        u.display_name as host_name,
        winner.display_name as winner_name
      FROM competitions c
      LEFT JOIN users u ON c.host_id = u.id
      LEFT JOIN users winner ON c.winner_id = winner.id
      WHERE c.id = $1
    `, [id]);

    if (competitionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    // Get entries
    const entriesResult = await pool.query(`
      SELECT 
        e.*,
        u.display_name as user_name
      FROM entries e
      LEFT JOIN users u ON e.user_id = u.id
      WHERE e.competition_id = $1
      ORDER BY e.bracket_position
    `, [id]);

    // Get bracket matches if voting has started
    const matchesResult = await pool.query(`
      SELECT 
        m.*,
        e1.selection as entry1_selection,
        e1.image_url as entry1_image,
        e2.selection as entry2_selection,
        e2.image_url as entry2_image,
        winner.selection as winner_selection
      FROM matches m
      LEFT JOIN entries e1 ON m.entry1_id = e1.id
      LEFT JOIN entries e2 ON m.entry2_id = e2.id
      LEFT JOIN entries winner ON m.winner_id = winner.id
      WHERE m.competition_id = $1
      ORDER BY m.round_number, m.match_number
    `, [id]);

    res.json({
      competition: competitionResult.rows[0],
      entries: entriesResult.rows,
      matches: matchesResult.rows
    });
  } catch (error) {
    console.error('Get competition details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new competition (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { title, topic, hostId, entryDeadline } = req.body;

    const result = await pool.query(`
      INSERT INTO competitions (title, topic, host_id, entry_deadline, status)
      VALUES ($1, $2, $3, $4, 'accepting_entries')
      RETURNING *
    `, [title, topic, hostId, entryDeadline]);

    // Add to host history
    await pool.query(
      'INSERT INTO host_history (user_id, competition_id) VALUES ($1, $2)',
      [hostId, result.rows[0].id]
    );

    // Update host stats
    await pool.query(`
      UPDATE user_stats 
      SET times_hosted = times_hosted + 1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
    `, [hostId]);

    const io = req.app.get('io');
    io.emit('competition-created', result.rows[0]);

    res.status(201).json({ competition: result.rows[0] });
  } catch (error) {
    console.error('Create competition error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Select random host from eligible users
router.post('/select-host', adminAuth, async (req, res) => {
  try {
    // Get users who participated in the last competition but haven't hosted in last 3 competitions
    const eligibleHostsResult = await pool.query(`
      WITH last_competition AS (
        SELECT id FROM competitions 
        WHERE status = 'completed' 
        ORDER BY created_at DESC 
        LIMIT 1
      ),
      recent_hosts AS (
        SELECT DISTINCT hh.user_id
        FROM host_history hh
        JOIN competitions c ON hh.competition_id = c.id
        WHERE c.status = 'completed'
        ORDER BY c.created_at DESC
        LIMIT 3
      ),
      last_participants AS (
        SELECT DISTINCT e.user_id
        FROM entries e
        JOIN last_competition lc ON e.competition_id = lc.id
        WHERE e.user_id IS NOT NULL
      )
      SELECT u.id, u.display_name
      FROM users u
      JOIN last_participants lp ON u.id = lp.user_id
      WHERE u.id NOT IN (SELECT user_id FROM recent_hosts)
      AND u.is_verified = true
    `);

    if (eligibleHostsResult.rows.length === 0) {
      return res.status(400).json({ message: 'No eligible hosts available' });
    }

    // Select random host
    const randomIndex = Math.floor(Math.random() * eligibleHostsResult.rows.length);
    const selectedHost = eligibleHostsResult.rows[randomIndex];

    res.json({ selectedHost });
  } catch (error) {
    console.error('Select host error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;