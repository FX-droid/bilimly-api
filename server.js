const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth').router;  // <-- note `.router` here
const lessonRoutes = require('./routes/lessons');
const userRoutes = require('./routes/users');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Bilimly API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
