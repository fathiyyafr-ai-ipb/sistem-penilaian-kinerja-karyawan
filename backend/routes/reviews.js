const express = require('express');
const router  = express.Router();
const {
  getReviews,
  getSubordinates,
  createReview,
  updateReview,
  deleteReview,
  validateReview,
  validateBulk
} = require('../controllers/reviewController');
const { verifyToken, authorize } = require('../middleware/auth');

// Daftar pegawai yang bisa dinilai oleh penilai yg login
router.get('/subordinates',
  verifyToken,
  authorize('ketua_tim', 'kasubag', 'admin'),
  getSubordinates
);

// Ambil semua/sebagian penilaian (filter otomatis berdasarkan role di controller)
router.get('/',
  verifyToken,
  getReviews
);

// Buat penilaian baru
router.post('/',
  verifyToken,
  authorize('ketua_tim', 'kasubag', 'admin'),
  createReview
);

// Edit penilaian (akses & aturan diperiksa di dalam controller)
router.put('/:id',
  verifyToken,
  updateReview
);

// Hapus penilaian
router.delete('/:id',
  verifyToken,
  deleteReview
);

// Validasi satu penilaian oleh Kepala BPS
router.post('/:id/validate',
  verifyToken,
  authorize('kepala_bps', 'admin'),
  validateReview
);

// Validasi banyak penilaian sekaligus (bulk)
router.post('/validate-bulk',
  verifyToken,
  authorize('kepala_bps', 'admin'),
  validateBulk
);

module.exports = router;
