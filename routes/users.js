const express = require('express');
const fs = require('fs');
const path = require('path');
const { authenticateToken, authorizeAdmin } = require('./auth');


const router = express.Router();
const usersFile = path.join(__dirname, '../data/users.json');

function readUsers() {
  return JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
}

function writeUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

router.get('/', (req, res) => {
    let users = readUsers();
    const { region, city, name, phone } = req.query;
  
    if (region) users = users.filter(u => u.region.toLowerCase() === region.toLowerCase());
    if (city) users = users.filter(u => u.city.toLowerCase() === city.toLowerCase());
    if (name) users = users.filter(u => u.name.toLowerCase().includes(name.toLowerCase()));
    if (phone) users = users.filter(u => u.phone === phone);
  
    res.json(users);
  });
  

// ✅ Get user by ID
router.get('/:id', (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === +req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// ✅ Add a new user
router.post('/', (req, res) => {
    const users = readUsers();
    const newUser = req.body;
  
    // Add defaults
    newUser.id = users.length ? users[users.length - 1].id + 1 : 1;
    newUser.bilimTokens = newUser.bilimTokens || 0;
  
    if (!newUser.phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }
  
    users.push(newUser);
    writeUsers(users);
    res.status(201).json(newUser);
  });
  
// ✅ Update user (e.g., name, city, tokens)
router.put('/:id', (req, res) => {
  const users = readUsers();
  const id = +req.params.id;
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ message: "User not found" });

  users[index] = { ...users[index], ...req.body, id };
  writeUsers(users);
  res.json(users[index]);
});

// ✅ Delete user
router.delete('/:id', (req, res) => {
  let users = readUsers();
  users = users.filter(u => u.id !== +req.params.id);
  writeUsers(users);
  res.json({ message: "User deleted" });
});

router.get('/me', authenticateToken, (req, res) => {
  const users = readUsers(); // read from users.json
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

module.exports = router;
