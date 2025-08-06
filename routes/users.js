const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, '../data/users.json');

function readUsers() {
  return JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
}

function writeUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// Get all users
router.get('/', (req, res) => {
  res.json(readUsers());
});

// Get user by ID
router.get('/:id', (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === +req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// Add user
router.post('/', (req, res) => {
  const users = readUsers();
  const newUser = req.body;
  newUser.id = users.length ? users[users.length - 1].id + 1 : 1;
  users.push(newUser);
  writeUsers(users);
  res.status(201).json(newUser);
});

// Update user tokens
router.put('/:id', (req, res) => {
  const users = readUsers();
  const id = +req.params.id;
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ message: "User not found" });

  users[index] = { ...users[index], ...req.body, id };
  writeUsers(users);
  res.json(users[index]);
});

// Delete user
router.delete('/:id', (req, res) => {
  let users = readUsers();
  users = users.filter(u => u.id !== +req.params.id);
  writeUsers(users);
  res.json({ message: "User deleted" });
});

module.exports = router;
