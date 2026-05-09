const express = require('express');
const router  = express.Router();
const { getAttendance, upsertAttendance } = require('../controllers/attendanceController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/',  verifyToken, getAttendance);
router.post('/', verifyToken, authorize('kasubag'), upsertAttendance);

module.exports = router;
