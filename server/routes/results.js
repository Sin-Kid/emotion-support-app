const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/results/survey — save survey result
router.post('/survey', requireAuth, async (req, res) => {
  const { responses, analysisData } = req.body;
  const userId = req.user.id;

  if (!responses || !analysisData) {
    return res.status(400).json({ error: 'Responses and analysis data are required.' });
  }

  try {
    const identifiedProblems = analysisData.identifiedProblems || [];
    const result = await pool.query(
      `INSERT INTO survey_results (user_id, responses, analysis_data, identified_problems)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      [userId, JSON.stringify(responses), JSON.stringify(analysisData), identifiedProblems]
    );
    res.status(201).json({ success: true, id: result.rows[0].id, createdAt: result.rows[0].created_at });
  } catch (err) {
    console.error('Save survey error:', err.message);
    res.status(500).json({ error: 'Failed to save survey results.' });
  }
});

// POST /api/results/checkin — save daily mood check-in
router.post('/checkin', requireAuth, async (req, res) => {
  const { mood } = req.body;
  const userId = req.user.id;

  if (!mood || mood < 1 || mood > 5) {
    return res.status(400).json({ error: 'Mood must be a number between 1 and 5.' });
  }

  // Check if already checked in today
  const today = new Date().toISOString().split('T')[0];
  try {
    const existing = await pool.query(
      `SELECT id FROM daily_checkins
       WHERE user_id = $1 AND DATE(created_at) = $2`,
      [userId, today]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'You have already checked in today! Come back tomorrow.' });
    }

    const result = await pool.query(
      'INSERT INTO daily_checkins (user_id, mood) VALUES ($1, $2) RETURNING id, created_at',
      [userId, mood]
    );
    res.status(201).json({ success: true, id: result.rows[0].id, createdAt: result.rows[0].created_at });
  } catch (err) {
    console.error('Save checkin error:', err.message);
    res.status(500).json({ error: 'Failed to save check-in.' });
  }
});

// GET /api/results/me — get current user's full history
router.get('/me', requireAuth, async (req, res) => {
  const userId = req.user.id;

  try {
    const surveys = await pool.query(
      `SELECT id, responses, analysis_data, identified_problems, created_at
       FROM survey_results WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    const checkins = await pool.query(
      `SELECT id, mood, created_at
       FROM daily_checkins WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    const allResults = [
      ...surveys.rows.map(r => ({
        type: 'survey',
        id: r.id,
        timestamp: r.created_at,
        analysisData: r.analysis_data,
        responses: r.responses,
        identifiedProblems: r.identified_problems,
      })),
      ...checkins.rows.map(r => ({
        type: 'dailyCheckIn',
        id: r.id,
        timestamp: r.created_at,
        mood: r.mood,
      })),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({ results: allResults });
  } catch (err) {
    console.error('Get results error:', err.message);
    res.status(500).json({ error: 'Failed to fetch results.' });
  }
});

module.exports = router;
