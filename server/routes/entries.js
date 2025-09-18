const express = require('express');
const pool = require('../database/connection');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Submit entry for competition
router.post('/', auth, async (req, res) => {
  try {
    const { competitionId, selection, imageUrl } = req.body;

    // Check if competition is accepting entries
    const competitionResult = await pool.query(
      'SELECT id, status, entry_deadline FROM competitions WHERE id = $1',
      [competitionId]
    );

    if (competitionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    const competition = competitionResult.rows[0];
    if (competition.status !== 'accepting_entries') {
      return res.status(400).json({ message: 'Competition is not accepting entries' });
    }

    if (new Date() > new Date(competition.entry_deadline)) {
      return res.status(400).json({ message: 'Entry deadline has passed' });
    }

    // Check if user already has an entry
    const existingEntry = await pool.query(
      'SELECT id FROM entries WHERE competition_id = $1 AND user_id = $2',
      [competitionId, req.user.id]
    );

    if (existingEntry.rows.length > 0) {
      return res.status(400).json({ message: 'You have already submitted an entry' });
    }

    // Create entry
    const result = await pool.query(`
      INSERT INTO entries (competition_id, user_id, selection, image_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [competitionId, req.user.id, selection, imageUrl]);

    res.status(201).json({ entry: result.rows[0] });
  } catch (error) {
    console.error('Submit entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's entry for a competition
router.get('/my-entry/:competitionId', auth, async (req, res) => {
  try {
    const { competitionId } = req.params;

    const result = await pool.query(
      'SELECT * FROM entries WHERE competition_id = $1 AND user_id = $2',
      [competitionId, req.user.id]
    );

    res.json({ entry: result.rows[0] || null });
  } catch (error) {
    console.error('Get user entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update entry (before deadline)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { selection, imageUrl } = req.body;

    // Check if entry belongs to user and competition is still accepting entries
    const entryResult = await pool.query(`
      SELECT e.*, c.status, c.entry_deadline
      FROM entries e
      JOIN competitions c ON e.competition_id = c.id
      WHERE e.id = $1 AND e.user_id = $2
    `, [id, req.user.id]);

    if (entryResult.rows.length === 0) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    const entry = entryResult.rows[0];
    if (entry.status !== 'accepting_entries') {
      return res.status(400).json({ message: 'Cannot update entry after deadline' });
    }

    if (new Date() > new Date(entry.entry_deadline)) {
      return res.status(400).json({ message: 'Entry deadline has passed' });
    }

    // Update entry
    const result = await pool.query(
      'UPDATE entries SET selection = $1, image_url = $2 WHERE id = $3 RETURNING *',
      [selection, imageUrl, id]
    );

    res.json({ entry: result.rows[0] });
  } catch (error) {
    console.error('Update entry error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;