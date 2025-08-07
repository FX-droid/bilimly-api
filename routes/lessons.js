const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const lessonsFile = path.join(__dirname, '../data/lessons.json');

// Read lessons from file
function readLessons() {
  const data = fs.readFileSync(lessonsFile, 'utf-8');
  return JSON.parse(data || '[]');
}

// Write lessons to file
function writeLessons(lessons) {
  fs.writeFileSync(lessonsFile, JSON.stringify(lessons, null, 2));
}

/**
 * GET /api/lessons
 * Optional query params:
 * - lang (en/uz/ru)
 * - category (e.g., Future Jobs or Subjects)
 */
router.get('/', (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const category = req.query.category;
    let lessons = readLessons();

    if (category) {
      lessons = lessons.filter(lesson => lesson.category.toLowerCase() === category.toLowerCase());
    }

    const localizedLessons = lessons.map(lesson => ({
      id: lesson.id,
      category: lesson.category,
      name: lesson.name[lang] || lesson.name['en'],
      description: lesson.description[lang] || lesson.description['en'],
      content: lesson.content.map(item => ({
        title: item.title,
        videoUrl: item.videoUrl,
        text: item.text[lang] || item.text['en']
      })),
      image: lesson.image,
      quiz: lesson.quiz.map(q => ({
        type: q.type,
        question: q.question?.[lang] || q.question?.['en'] || q.question,
        options: q.options ? (q.options[lang] || q.options['en']) : [],
        answer: q.answer
      }))
    }));

    res.json(localizedLessons);
  } catch (error) {
    console.error('Error in GET /api/lessons:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/lessons/:id
 */
router.get('/:id', (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const lessons = readLessons();
    const lesson = lessons.find(l => l.id === +req.params.id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const localizedLesson = {
      id: lesson.id,
      category: lesson.category,
      name: lesson.name[lang] || lesson.name['en'],
      description: lesson.description[lang] || lesson.description['en'],
      content: lesson.content.map(item => ({
        title: item.title,
        videoUrl: item.videoUrl,
        text: item.text[lang] || item.text['en']
      })),
      image: lesson.image,
      quiz: lesson.quiz.map(q => ({
        type: q.type,
        question: q.question?.[lang] || q.question?.['en'] || q.question,
        options: q.options ? (q.options[lang] || q.options['en']) : [],
        answer: q.answer
      }))
    };

    res.json(localizedLesson);
  } catch (error) {
    console.error('Error in GET /api/lessons/:id:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 🔐 Protected routes for Admin
const { authenticateToken, authorizeAdmin } = require('./auth');

// Create lesson
router.post('/', authenticateToken, authorizeAdmin, (req, res) => {
  try {
    const lessons = readLessons();
    const newLesson = req.body;
    newLesson.id = lessons.length ? lessons[lessons.length - 1].id + 1 : 1;
    lessons.push(newLesson);
    writeLessons(lessons);
    res.status(201).json(newLesson);
  } catch (error) {
    console.error('Error in POST /api/lessons:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update lesson
router.put('/:id', authenticateToken, authorizeAdmin, (req, res) => {
  try {
    const lessons = readLessons();
    const id = +req.params.id;
    const index = lessons.findIndex(l => l.id === id);
    if (index === -1) return res.status(404).json({ message: "Lesson not found" });

    lessons[index] = { ...lessons[index], ...req.body, id };
    writeLessons(lessons);
    res.json(lessons[index]);
  } catch (error) {
    console.error('Error in PUT /api/lessons/:id:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete lesson
router.delete('/:id', authenticateToken, authorizeAdmin, (req, res) => {
  try {
    let lessons = readLessons();
    const id = +req.params.id;
    lessons = lessons.filter(l => l.id !== id);
    writeLessons(lessons);
    res.json({ message: "Lesson deleted" });
  } catch (error) {
    console.error('Error in DELETE /api/lessons/:id:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
