const express = require('express');
const router  = express.Router();
const { getProgress, createProgress, updateProgress, upload } = require('../controllers/progressController');
const { verifyToken } = require('../middleware/auth');

router.get('/',  verifyToken, getProgress);
router.post('/', verifyToken, upload.single('file_report'), createProgress);
router.put('/:id', verifyToken, upload.single('file_report'), updateProgress);

module.exports = router;
