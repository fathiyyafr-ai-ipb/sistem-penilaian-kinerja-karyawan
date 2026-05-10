const express = require('express');
const router  = express.Router();
const { getAllTeams, createTeam, addMember, updateTeam, deleteTeam } = require('../controllers/teamController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/',          verifyToken, getAllTeams);
router.post('/',         verifyToken, authorize('kasubag', 'kepala_bps'), createTeam);
router.post('/add-member', verifyToken, authorize('kasubag', 'kepala_bps'), addMember);
router.put('/:id',       verifyToken, authorize('kasubag', 'kepala_bps'), updateTeam);
router.delete('/:id',    verifyToken, authorize('kasubag', 'kepala_bps'), deleteTeam);

module.exports = router;
