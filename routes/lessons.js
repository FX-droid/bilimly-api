const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const lessonsFile = path.join(__dirname, '../data/lessons.json');

function readLessons() {
  const data = fs.readFileSync(lessonsFile, 'utf-8');
  return JSON.parse(data || '[]');
}

function writeLessons(lessons) {
  fs.writeFileSync(lessonsFile, JSON.stringify(lessons, null, 2));
}

router.get('/', (req, res) => {
    const lang = req.query.lang || 'en';
    const category = req.query.category; // <-- NEW
    let lessons = readLessons();
  
    if (category) {
      lessons = lessons.filter(lesson => lesson.category.toLowerCase() === category.toLowerCase());
    }
  
    const localizedLessons = lessons.map(lesson => ({
      id: lesson.id,
      category: lesson.category,
      name: lesson.name[lang] || lesson.name['en'],
      description: lesson.description[lang] || lesson.description['en'],
      content: lesson.content[lang] || lesson.content['en'],
      image: lesson.image,
      quiz: lesson.quiz.map(q => ({
        question: q.question[lang] || q.question['en'],
        options: q.options[lang] || q.options['en'],
        answer: q.answer
      }))
    }));
  
    res.json(localizedLessons);
});
  

// GET lesson by ID
router.get('/:id', (req, res) => {
  const lang = req.query.lang || 'en';
  const lessons = readLessons();
  const lesson = lessons.find(l => l.id === +req.params.id);
  if (!lesson) return res.status(404).json({ message: "Lesson not found" });

  const localizedLesson = {
    id: lesson.id,
    category: lesson.category,
    name: lesson.name[lang] || lesson.name['en'],
    description: lesson.description[lang] || lesson.description['en'],
    content: lesson.content[lang] || lesson.content['en'],
    image: lesson.image,
    quiz: lesson.quiz.map(q => ({
      question: q.question[lang] || q.question['en'],
      options: q.options[lang] || q.options['en'],
      answer: q.answer
    }))
  };

  res.json(localizedLesson);
});

// Protected Routes - add/update/delete require admin

const { authenticateToken, authorizeAdmin } = require('./auth');

// Create lesson
router.post('/', authenticateToken, authorizeAdmin, (req, res) => {
  const lessons = readLessons();
  const newLesson = req.body;
  newLesson.id = lessons.length ? lessons[lessons.length - 1].id + 1 : 1;
  lessons.push(newLesson);
  writeLessons(lessons);
  res.status(201).json(newLesson);
});

// Update lesson
router.put('/:id', authenticateToken, authorizeAdmin, (req, res) => {
  const lessons = readLessons();
  const id = +req.params.id;
  const index = lessons.findIndex(l => l.id === id);
  if (index === -1) return res.status(404).json({ message: "Lesson not found" });

  lessons[index] = { ...lessons[index], ...req.body, id };
  writeLessons(lessons);
  res.json(lessons[index]);
});

// Delete lesson
router.delete('/:id', authenticateToken, authorizeAdmin, (req, res) => {
  let lessons = readLessons();
  const id = +req.params.id;
  lessons = lessons.filter(l => l.id !== id);
  writeLessons(lessons);
  res.json({ message: "Lesson deleted" });
});

module.exports = router;
