const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { followUser, unfollowUser, getUserProfile } = require('../controllers/userController');

// Protect all routes with authentication middleware
router.use(authMiddleware);

// GET /api/users/:id
router.get('/:id', getUserProfile);

// POST /api/users/:id/follow
router.post('/:id/follow', followUser);

// POST /api/users/:id/unfollow
router.post('/:id/unfollow', unfollowUser);

module.exports = router;


