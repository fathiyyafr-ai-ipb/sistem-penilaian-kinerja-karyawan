const express = require('express');
const router  = express.Router();
const { getEmployeeOfMonth, getRanking, determineEOM, deleteEOM } = require('../controllers/eomController');
const { verifyToken, authorize } = require('../middleware/auth');

// Semua user bisa lihat hasil EOM
router.get('/',          verifyToken, getEmployeeOfMonth);

// Ranking live — hanya kepala_bps & admin
router.get('/ranking',   verifyToken, authorize('kepala_bps', 'admin'), getRanking);

// Tentukan EOM — hanya kepala_bps & admin
router.post('/determine',verifyToken, authorize('kepala_bps', 'admin'), determineEOM);

// Hapus EOM entry — hanya kepala_bps & admin
router.delete('/:id',    verifyToken, authorize('kepala_bps', 'admin'), deleteEOM);

module.exports = router;
