const express = require('express');
const router  = express.Router();
const { getAllTeams, createTeam, addMember, updateTeam, deleteTeam } = require('../controllers/teamController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/',          verifyToken, getAllTeams);
router.post('/',         verifyToken, authorize('kasubag', 'kepala_bps', 'admin'), createTeam);
router.post('/add-member', verifyToken, authorize('kasubag', 'kepala_bps', 'admin'), addMember);
router.put('/:id',       verifyToken, authorize('kasubag', 'kepala_bps', 'admin'), updateTeam);
router.delete('/:id',    verifyToken, authorize('kasubag', 'kepala_bps', 'admin'), deleteTeam);

module.exports = router;
