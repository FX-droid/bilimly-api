const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, '../data/users.json');

function readUsers() {
  return JSON.parse(fs.readFileSync(usersFile, 'utf-8') || '[]');
}

const SECRET_KEY = process.env.SECRET_KEY || "supersecretkey";

// Signup route
router.post('/signup', async (req, res) => {
  const { username, password, name, region, city, phone } = req.body;
  const users = readUsers();

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    username,
    password: hashedPassword,
    name,
    region,
    city,
    phone,
    bilimTokens: 50,
    role: "user"
  };

  users.push(newUser);
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  res.status(201).json({ message: "User registered" });
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.username === username);

  if (!user) return res.status(400).json({ message: "Invalid username or password" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid username or password" });

  const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '2h' });
  const { password: _, ...userWithoutPassword } = user;

  res.json({ token, user: userWithoutPassword });
});

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Token missing" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

module.exports = {
  router,
  authenticateToken,
  authorizeAdmin
};