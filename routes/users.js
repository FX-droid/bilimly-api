const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('./auth');

const router = express.Router();
const usersFile = path.join(__dirname, '../data/users.json');

function readUsers() {
  return JSON.parse(fs.readFileSync(usersFile, 'utf-8') || '[]');
}

// GET /users/me - returns current logged-in user info
router.get('/me', authenticateToken, (req, res) => {
  const users = readUsers();
  const userId = req.user.id;

  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  // Don't send password
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

module.exports = router;
