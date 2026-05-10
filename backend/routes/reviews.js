const express = require('express');
const router  = express.Router();
const { getReviews, createStage1, createStage2, validateFinal, updateReview, deleteReview } = require('../controllers/reviewController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/',          verifyToken, getReviews);
router.post('/stage1',   verifyToken, authorize('ketua_tim', 'admin'), createStage1);
router.post('/stage2',   verifyToken, authorize('kasubag', 'admin'),   createStage2);
router.put('/:id',       verifyToken, authorize('ketua_tim', 'kasubag', 'admin'), updateReview);
router.delete('/:id',    verifyToken, authorize('ketua_tim', 'kasubag', 'admin'), deleteReview);
router.post('/validate', verifyToken, authorize('kepala_bps', 'admin'), validateFinal);

module.exports = router;
