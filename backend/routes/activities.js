const express = require('express');
const router  = express.Router();
const { getActivities, createActivity, updateActivity, getActivityMonitoring, deleteActivity } = require('../controllers/activityController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/',      verifyToken, getActivities);
router.post('/',     verifyToken, authorize('ketua_tim', 'admin', 'kasubag', 'kepala_bps'), createActivity);
router.put('/:id',   verifyToken, authorize('ketua_tim', 'admin', 'kasubag', 'kepala_bps'), updateActivity);
router.delete('/:id', verifyToken, authorize('ketua_tim', 'admin', 'kasubag', 'kepala_bps'), deleteActivity);
router.get('/:id/monitoring', verifyToken, getActivityMonitoring);

module.exports = router;
