const express = require('express');
const router  = express.Router();
const { getAllTeams, createTeam, addMember } = require('../controllers/teamController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/',          verifyToken, getAllTeams);
router.post('/',         verifyToken, authorize('admin'), createTeam);
router.post('/add-member', verifyToken, authorize('admin'), addMember);

module.exports = router;
