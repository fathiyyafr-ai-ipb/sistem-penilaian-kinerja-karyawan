const express = require('express');
const router  = express.Router();
const { getReviews, createStage1, createStage2, validateFinal } = require('../controllers/reviewController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/',          verifyToken, getReviews);
router.post('/stage1',   verifyToken, authorize('ketua_tim'), createStage1);
router.post('/stage2',   verifyToken, authorize('kasubag'),   createStage2);
router.post('/validate', verifyToken, authorize('kepala_bps'), validateFinal);

module.exports = router;
