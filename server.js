const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

let lessons = require('./data/lessons.json');

// ✅ Get lessons with language support
app.get('/api/lessons', (req, res) => {
  const lang = req.query.lang || 'en';
  const localizedLessons = lessons.map(lesson => ({
    id: lesson.id,
    category: lesson.category,
    name: lesson.name[lang],
    description: lesson.description[lang],
    content: lesson.content[lang],
    image: lesson.image,
    quiz: lesson.quiz.map(q => ({
      question: q.question[lang],
      options: q.options[lang],
      answer: q.answer
    }))
  }));
  res.json(localizedLessons);
});

// ✅ Get single lesson
app.get('/api/lessons/:id', (req, res) => {
  const lang = req.query.lang || 'en';
  const lesson = lessons.find(l => l.id === parseInt(req.params.id));
  if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

  const localizedLesson = {
    id: lesson.id,
    category: lesson.category,
    name: lesson.name[lang],
    description: lesson.description[lang],
    content: lesson.content[lang],
    image: lesson.image,
    quiz: lesson.quiz.map(q => ({
      question: q.question[lang],
      options: q.options[lang],
      answer: q.answer
    }))
  };

  res.json(localizedLesson);
});

// ✅ Create lesson
app.post('/api/lessons', (req, res) => {
  const { category, name, description, content, image, quiz } = req.body;
  const newLesson = {
    id: lessons.length ? lessons[lessons.length - 1].id + 1 : 1,
    category,
    name,
    description,
    content,
    image,
    quiz
  };
  lessons.push(newLesson);
  fs.writeFileSync('./data/lessons.json', JSON.stringify(lessons, null, 2));
  res.status(201).json(newLesson);
});

// ✅ Update lesson
app.put('/api/lessons/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = lessons.findIndex(l => l.id === id);
  if (index === -1) return res.status(404).json({ message: 'Lesson not found' });

  lessons[index] = { ...lessons[index], ...req.body };
  fs.writeFileSync('./data/lessons.json', JSON.stringify(lessons, null, 2));
  res.json(lessons[index]);
});

// ✅ Delete lesson
app.delete('/api/lessons/:id', (req, res) => {
  const id = parseInt(req.params.id);
  lessons = lessons.filter(l => l.id !== id);
  fs.writeFileSync('./data/lessons.json', JSON.stringify(lessons, null, 2));
  res.json({ message: 'Lesson deleted' });
});

// ✅ Start server
app.listen(port, () => {
  console.log(`Bilimly API running at http://localhost:${port}`);
});
