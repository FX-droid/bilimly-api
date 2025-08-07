const express = require('express');
const cors = require('cors');
const { router: authRoutes } = require('./middleware/auth');
const userRoutes = require('./routes/users');
const lessonRoutes = require('./routes/lessons'); // Make sure lessons.js exports router

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lessons', lessonRoutes);

app.get('/', (req, res) => {
  res.send('Bilimly API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
