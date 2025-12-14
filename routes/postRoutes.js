const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createPost, likePost, unlikePost, commentPost, getFeedPosts, getPostById } = require('../controllers/postController');
const { getFeed } = require("../controllers/postController");
// Protect all routes with authentication middleware
router.use(authMiddleware);

// POST /api/posts (create post)
router.post('/', createPost);

// GET /api/posts/feed
router.get('/feed', getFeedPosts);

// GET /api/posts/:id
router.get('/:id', getPostById);

// POST /api/posts/:id/like
router.post('/:id/like', likePost);

// POST /api/posts/:id/unlike
router.post('/:id/unlike', unlikePost);

// POST /api/posts/:id/comment
router.post('/:id/comment', commentPost);

module.exports = router;

