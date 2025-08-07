const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('./auth');

const router = express.Router();
const usersFile = path.join(__dirname, '../data/users.json');

function readUsers() {
  return JSON.parse(fs.readFileSync(usersFile, 'utf-8') || '[]');
}

function writeUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// GET all users with optional filtering
router.get('/', (req, res) => {
  let users = readUsers();
  const { region, city, name, phone } = req.query;

  if (region) users = users.filter(u => u.region.toLowerCase() === region.toLowerCase());
  if (city) users = users.filter(u => u.city.toLowerCase() === city.toLowerCase());
  if (name) users = users.filter(u => u.name.toLowerCase().includes(name.toLowerCase()));
  if (phone) users = users.filter(u => u.phone === phone);

  res.json(users);
});

// GET user by id
router.get('/:id', (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === +req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// GET current logged-in user info
router.get('/me', authenticateToken, (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

// Add, update, delete routes omitted for brevity but can be added similarly

module.exports = router;
