const express = require('express');
const pool = require('../database/connection');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Cast vote for a match
router.post('/vote', auth, async (req, res) => {
  try {
    const { matchId, entryId } = req.body;

    // Check if match exists and is in voting phase
    const matchResult = await pool.query(`
      SELECT m.*, c.status
      FROM matches m
      JOIN competitions c ON m.competition_id = c.id
      WHERE m.id = $1
    `, [matchId]);

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const match = matchResult.rows[0];
    if (match.status !== 'voting') {
      return res.status(400).json({ message: 'Competition is not in voting phase' });
    }
    
    // Also check if this specific match is open for voting
    if (match.status === 'pending' || match.status === 'completed') {
      return res.status(400).json({ message: 'This match is not currently open for voting' });
    }

    // Check if the round is currently active based on round schedules
    const roundScheduleResult = await pool.query(`
      SELECT start_time, end_time, round_name
      FROM round_schedules
      WHERE competition_id = $1 AND round_number = $2
    `, [match.competition_id, match.round_number]);

    if (roundScheduleResult.rows.length > 0) {
      const schedule = roundScheduleResult.rows[0];
      const now = new Date();
      const startTime = new Date(schedule.start_time);
      const endTime = new Date(schedule.end_time);

      if (now < startTime) {
        return res.status(400).json({ 
          message: `Voting for ${schedule.round_name} has not started yet. Voting opens at ${startTime.toLocaleString()}.` 
        });
      }

      if (now > endTime) {
        return res.status(400).json({ 
          message: `Voting for ${schedule.round_name} has ended. Voting closed at ${endTime.toLocaleString()}.` 
        });
      }
    }

    // Check if entry is valid for this match
    if (entryId !== match.entry1_id && entryId !== match.entry2_id) {
      return res.status(400).json({ message: 'Invalid entry for this match' });
    }

    // Check if user already voted
    const existingVote = await pool.query(
      'SELECT id FROM votes WHERE match_id = $1 AND user_id = $2',
      [matchId, req.user.id]
    );

    if (existingVote.rows.length > 0) {
      // Update existing vote
      await pool.query(
        'UPDATE votes SET entry_id = $1 WHERE match_id = $2 AND user_id = $3',
        [entryId, matchId, req.user.id]
      );
    } else {
      // Create new vote
      await pool.query(
        'INSERT INTO votes (match_id, user_id, entry_id) VALUES ($1, $2, $3)',
        [matchId, req.user.id, entryId]
      );
    }

    // Update match vote counts
    const voteCountsResult = await pool.query(`
      SELECT 
        entry_id,
        COUNT(*) as vote_count
      FROM votes 
      WHERE match_id = $1 
      GROUP BY entry_id
    `, [matchId]);

    let entry1Votes = 0;
    let entry2Votes = 0;
    let totalVotes = 0;

    voteCountsResult.rows.forEach(row => {
      if (row.entry_id === match.entry1_id) {
        entry1Votes = parseInt(row.vote_count);
      } else if (row.entry_id === match.entry2_id) {
        entry2Votes = parseInt(row.vote_count);
      }
      totalVotes += parseInt(row.vote_count);
    });

    // Update match with vote counts
    await pool.query(`
      UPDATE matches 
      SET entry1_votes = $1, entry2_votes = $2, total_votes = $3
      WHERE id = $4
    `, [entry1Votes, entry2Votes, totalVotes, matchId]);

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`competition-${match.competition_id}`).emit('vote-update', {
      matchId,
      entry1Votes,
      entry2Votes,
      totalVotes
    });

    res.json({ 
      success: true, 
      voteCount: { entry1Votes, entry2Votes, totalVotes } 
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's votes for a competition
router.get('/my-votes/:competitionId', auth, async (req, res) => {
  try {
    const { competitionId } = req.params;

    const result = await pool.query(`
      SELECT v.match_id, v.entry_id
      FROM votes v
      JOIN matches m ON v.match_id = m.id
      WHERE m.competition_id = $1 AND v.user_id = $2
    `, [competitionId, req.user.id]);

    const votes = {};
    result.rows.forEach(row => {
      votes[row.match_id] = row.entry_id;
    });

    res.json({ votes });
  } catch (error) {
    console.error('Get user votes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Finalize match (determine winner)
router.post('/finalize-match/:matchId', auth, async (req, res) => {
  try {
    const { matchId } = req.params;

    const matchResult = await pool.query(`
      SELECT m.*, c.host_id
      FROM matches m
      JOIN competitions c ON m.competition_id = c.id
      WHERE m.id = $1
    `, [matchId]);

    if (matchResult.rows.length === 0) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const match = matchResult.rows[0];

    // Only host or admin can finalize matches
    if (match.host_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ message: 'Only the host can finalize matches' });
    }

    let winnerId;
    let isTie = false;
    let coinFlipWinner = null;

    if (match.entry1_votes > match.entry2_votes) {
      winnerId = match.entry1_id;
    } else if (match.entry2_votes > match.entry1_votes) {
      winnerId = match.entry2_id;
    } else {
      // It's a tie - coin flip
      isTie = true;
      coinFlipWinner = Math.random() < 0.5 ? match.entry1_id : match.entry2_id;
      winnerId = coinFlipWinner;
    }

    // Update match
    await pool.query(`
      UPDATE matches 
      SET winner_id = $1, is_tie = $2, coin_flip_winner = $3, status = 'completed'
      WHERE id = $4
    `, [winnerId, isTie, coinFlipWinner, matchId]);

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`competition-${match.competition_id}`).emit('match-finalized', {
      matchId,
      winnerId,
      isTie,
      coinFlipWinner
    });

    res.json({ 
      success: true, 
      winnerId, 
      isTie, 
      coinFlipWinner 
    });
  } catch (error) {
    console.error('Finalize match error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;