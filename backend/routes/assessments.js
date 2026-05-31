const express = require('express');
const router = express.Router();
const {
  getWeights,
  updateWeights,
  getLeaderActivities,
  saveActivityEvaluation,
  getLeaderBehavior,
  saveBehaviorEvaluation,
  getKasubagAttendance,
  saveAttendanceEvaluation,
  getBpsReview,
  validateAssessment,
  publishPeriod,
  getMyScore,
  getTop3,
  getNotifications,
  markNotificationsRead,
  getAssessmentReportDetail
} = require('../controllers/assessmentController');
const { verifyToken, authorize } = require('../middleware/auth');

// Admin Weights
router.get('/weights', verifyToken, getWeights);
router.put('/weights', verifyToken, authorize('admin'), updateWeights);

// Ketua Tim (Kinerja per Kegiatan & Perilaku)
router.get('/leader/activities', verifyToken, authorize('ketua_tim'), getLeaderActivities);
router.post('/leader/activities', verifyToken, authorize('ketua_tim'), saveActivityEvaluation);
router.get('/leader/behavior', verifyToken, authorize('ketua_tim'), getLeaderBehavior);
router.post('/leader/behavior', verifyToken, authorize('ketua_tim'), saveBehaviorEvaluation);

// Kasubag (Presensi)
router.get('/kasubag/attendance', verifyToken, authorize('kasubag'), getKasubagAttendance);
router.post('/kasubag/attendance', verifyToken, authorize('kasubag'), saveAttendanceEvaluation);

// Kepala BPS (Review, Validasi, Publish)
router.get('/bps/review', verifyToken, authorize('kepala_bps', 'admin', 'kasubag', 'ketua_tim'), getBpsReview);
router.post('/bps/validate', verifyToken, authorize('kepala_bps'), validateAssessment);
router.post('/bps/publish', verifyToken, authorize('kepala_bps'), publishPeriod);
router.get('/report-detail', verifyToken, getAssessmentReportDetail);

// Pegawai / All
router.get('/my-score', verifyToken, getMyScore);
router.get('/top-3', verifyToken, getTop3);

// Notifications
router.get('/notifications', verifyToken, getNotifications);
router.post('/notifications/read', verifyToken, markNotificationsRead);

module.exports = router;
