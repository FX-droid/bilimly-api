const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {
  const dataPath = path.join(__dirname, '../data/siteContent.json');
  const raw = fs.readFileSync(dataPath);
  const data = JSON.parse(raw);
  res.json(data);
});

module.exports = router;
