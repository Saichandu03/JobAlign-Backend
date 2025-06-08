const express = require('express');
const router = express.Router();
const multer = require('multer');
const { addResume } = require('../controllers/resumeController');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/addResume/:userId', upload.single('resume'), addResume);

module.exports = router;
