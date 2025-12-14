const Post = require('../models/Post');
const User = require('../models/User');

// Create post
const createPost = async (req, res) => {
  try {
    const { imageUrl, caption } = req.body;
    const userId = req.user; // Authenticated user id

    // Create new post
    const post = new Post({
      user: userId,
      imageUrl,
      caption
    });

    await post.save();

    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
};

// Like post
const likePost = async (req, res) => {
  try {
    const { id } = req.params; // Post id
    const userId = req.user; // Authenticated user id

    // Find post
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Add user id to likes array if not already liked
    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      await post.save();
    }

    res.status(200).json({ message: 'Post liked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error liking post', error: error.message });
  }
};

// Unlike post
const unlikePost = async (req, res) => {
  try {
    const { id } = req.params; // Post id
    const userId = req.user; // Authenticated user id

    // Find post
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Remove user id from likes array
    post.likes = post.likes.filter(
      likeUserId => likeUserId.toString() !== userId
    );
    await post.save();

    res.status(200).json({ message: 'Post unliked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error unliking post', error: error.message });
  }
};

// Comment on post
const commentPost = async (req, res) => {
  try {
    const { id } = req.params; // Post id
    const { text } = req.body;
    const userId = req.user; // Authenticated user id

    // Find post
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Add comment
    post.comments.push({
      user: userId,
      text
    });
    await post.save();

    res.status(200).json({ message: 'Comment added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
};

// Get feed posts
const getFeedPosts = async (req, res) => {
  try {
    const userId = req.user; // Logged-in user id

    // Find user and get their following array
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch posts where post.user is in following list
    const posts = await Post.find({ user: { $in: user.following } })
      .sort({ createdAt: -1 }) // Sort by createdAt descending
      .populate('user', 'username'); // Populate user basic info (username)

    res.status(200).json({ posts });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching feed posts', error: error.message });
  }
};

// Get post by id
const getPostById = async (req, res) => {
  try {
    const { id } = req.params; // Post id from params

    // Find post by id and populate user info and comments user info
    const post = await Post.findById(id)
      .populate('user', 'username') // Populate post user info (username)
      .populate('comments.user', 'username'); // Populate comments user info (username)

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Return post data
    res.status(200).json({ post });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
};

module.exports = {
  createPost,
  likePost,
  unlikePost,
  commentPost,
  getFeedPosts,
  getPostById
};

