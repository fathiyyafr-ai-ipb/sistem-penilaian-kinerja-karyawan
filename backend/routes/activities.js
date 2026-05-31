const express = require('express');
const router  = express.Router();
const { getActivities, createActivity, updateActivity, getActivityMonitoring, deleteActivity } = require('../controllers/activityController');
const { getTasks, manageTasks } = require('../controllers/taskController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/',      verifyToken, getActivities);
router.post('/',     verifyToken, authorize('ketua_tim', 'admin', 'kasubag', 'kepala_bps'), createActivity);
router.put('/:id',   verifyToken, authorize('ketua_tim', 'admin', 'kasubag', 'kepala_bps'), updateActivity);
router.delete('/:id', verifyToken, authorize('ketua_tim', 'admin', 'kasubag', 'kepala_bps'), deleteActivity);
router.get('/:id/monitoring', verifyToken, getActivityMonitoring);

// Rute sub-tugas (tasks)
router.get('/:activityId/tasks', verifyToken, getTasks);
router.post('/:activityId/tasks', verifyToken, authorize('ketua_tim', 'admin', 'kasubag', 'kepala_bps'), manageTasks);

module.exports = router;
