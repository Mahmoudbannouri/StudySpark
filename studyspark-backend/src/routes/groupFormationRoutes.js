// Rabie: Admin routes for group formation and refresh
import express from 'express';
import { protect as auth } from '../middleware/authMiddleware.js';
import { formGroupsForTopic, listGroupsWithMembers, refreshGroupsForTopic, rebalanceForTopic } from '../services/groupFormationService.js';
import { buildAggregatedFeatures } from '../services/studyGroupFeatureAggregator.js';
import { predict } from '../services/mlService.js';

const router = express.Router();

// POST /api/group-formation/form { topic, groupSize?, minMembers?, maxUsers? }
router.post('/form', auth, async (req, res) => {
  try {
    const { topic, groupSize, minMembers, maxUsers } = req.body || {};
    if (!topic) return res.status(400).json({ error: 'topic required' });
    const result = await formGroupsForTopic({ topic, groupSize, minMembers, maxUsers });
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('❌ form route error:', err.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/group-formation/list?topic=calculus
router.get('/list', auth, async (req, res) => {
  try {
    const { topic } = req.query;
    const result = await listGroupsWithMembers({ topic });
    // Compute user's estimated skill for the topic and predicted cluster
    let userSkill = null;
    let userCluster = null;
    if (req.user?.id) {
      const agg = await buildAggregatedFeatures({ userId: req.user.id, item: topic ? `topic:${topic}` : 'topic:general' });
      userSkill = Number((agg?.context?.normalized?.quizzes ?? 0.5).toFixed(3));
      try {
        const resp = await predict({ features: [userSkill, (agg?.context?.normalized?.availability ?? 0.5), (agg?.context?.normalized?.interests ?? 0.5)] });
        const proba = Array.isArray(resp?.probabilities) ? resp.probabilities[0] : null;
        const label = (Array.isArray(proba) ? (proba[1] >= proba[0] ? 1 : 0) : (resp?.prediction ?? 0));
        userCluster = label === 0 ? 'structured' : 'flexible';
      } catch (_) {
        userCluster = (userSkill >= 0.55 ? 'structured' : 'flexible');
      }
    }
    return res.json({ success: true, groups: result, userMetrics: { skill: userSkill, cluster: userCluster } });
  } catch (err) {
    console.error('❌ list route error:', err.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/group-formation/refresh { topic, groupSize?, minMembers?, maxUsers?, trigger? }
router.post('/refresh', auth, async (req, res) => {
  try {
    const { topic, groupSize, minMembers, maxUsers, trigger } = req.body || {};
    if (!topic) return res.status(400).json({ error: 'topic required' });
    const result = await refreshGroupsForTopic({ topic, groupSize, minMembers, maxUsers, trigger });
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('❌ refresh route error:', err.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/group-formation/rebalance { topic, cluster? }
router.post('/rebalance', auth, async (req, res) => {
  try {
    const { topic, cluster } = req.body || {};
    if (!topic) return res.status(400).json({ error: 'topic required' });
    const result = await rebalanceForTopic({ topic, cluster });
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('❌ rebalance route error:', err.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
