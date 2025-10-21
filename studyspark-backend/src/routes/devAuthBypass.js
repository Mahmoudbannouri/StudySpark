// Rabie: Temporary dev-only auth bypass routes for local testing only
// Do NOT commit or enable in production. Provides a simple way to obtain
// a JWT for a local user or to set an express-level dev user for requests.
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const router = express.Router();

// Issue a signed JWT for a given user id/email. This uses the same JWT
// secret as the main app (process.env.JWT_SECRET). For local testing only.
router.post('/issue-token', async (req, res) => {
  try {
    const { userId, email } = req.body;

    // Try to load the user if userId provided; otherwise create a minimal payload
    let user = null;
    if (userId) user = await User.findByPk(userId);

    const payload = user
      ? { id: user.id, email: user.email, role: user.role }
      : { id: userId || 0, email: email || 'dev@local', role: 'student' };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', {
      expiresIn: '7d',
    });

    return res.json({ success: true, token, payload });
  } catch (err) {
    console.error('❌ dev/issue-token error:', err.message || err);
    return res.status(500).json({ error: 'Failed to issue token' });
  }
});

// Convenience route: set a dev user on the request chain for the next handlers.
// This does not persist anything; it's useful when you want to POST from a client
// and have the backend treat the request as authenticated without using JWT.
router.post('/login-as', async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Return a small object confirming the dev-login; actual request injection
    // requires clients to set the Authorization header with the issued token.
    return res.json({ success: true, message: `Dev login as user ${userId}`, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error('❌ dev/login-as error:', err.message || err);
    return res.status(500).json({ error: 'Dev login failed' });
  }
});

export default router;
