const express = require('express');
const router = express.Router();
const teachController = require('../controllers/teachController');

// Get all subjects
router.get('/subjects', teachController.getSubjects);

// Get topics by subject
router.get('/topics/:subject', teachController.getTopicsBySubject);

// Generate teaching content
router.post('/teach', teachController.teachTopic);

module.exports = router;