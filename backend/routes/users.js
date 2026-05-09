const express = require('express');
const router  = express.Router();
const { getAllUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/',     verifyToken, authorize('admin','kasubag','kepala_bps', 'ketua_tim'), getAllUsers);
router.post('/',    verifyToken, authorize('admin'), createUser);
router.put('/:id',  verifyToken, authorize('admin'), updateUser);
router.delete('/:id', verifyToken, authorize('admin'), deleteUser);

module.exports = router;
