const express = require('express');
const cors = require('cors');
const { router: authRoutes } = require('./routes/auth');
const userRoutes = require('./routes/users');
const lessonRoutes = require('./routes/lessons');
const siteContentRoute = require('./routes/siteContent');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/site-content', siteContentRoute);

app.get('/', (req, res) => {
  res.send('Bilimly API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
