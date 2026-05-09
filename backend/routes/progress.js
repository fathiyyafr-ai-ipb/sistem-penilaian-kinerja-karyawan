const express = require('express');
const router  = express.Router();
const { getProgress, createProgress, upload } = require('../controllers/progressController');
const { verifyToken } = require('../middleware/auth');

router.get('/',  verifyToken, getProgress);
router.post('/', verifyToken, upload.single('file_report'), createProgress);

module.exports = router;
