const express = require('express');
const router = express.Router();
const multer = require('multer');
const { addResume, checkATS } = require('../controllers/resumeController');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/addResume', upload.single('resume'), addResume);
router.post('/checkATS', upload.single('resume'), checkATS);

module.exports = router;
