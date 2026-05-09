const express = require('express');
const router  = express.Router();
const { getEmployeeOfMonth, determineEOM } = require('../controllers/eomController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/',          verifyToken, getEmployeeOfMonth);
router.post('/determine',verifyToken, authorize('kepala_bps'), determineEOM);

module.exports = router;
