const User = require('../models/User');
const Post = require('../models/Post');

// Follow user
const followUser = async (req, res) => {
  try {
    const { id } = req.params; // User id to follow
    const currentUserId = req.user; // Authenticated user id

    // Prevent following self
    if (currentUserId === id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    // Check if user to follow exists
    const userToFollow = await User.findById(id);
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update current user's following array
    const currentUser = await User.findById(currentUserId);
    if (!currentUser.following.includes(id)) {
      currentUser.following.push(id);
      await currentUser.save();
    }

    // Update target user's followers array
    if (!userToFollow.followers.includes(currentUserId)) {
      userToFollow.followers.push(currentUserId);
      await userToFollow.save();
    }

    res.status(200).json({ message: 'User followed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error following user', error: error.message });
  }
};

// Unfollow user
const unfollowUser = async (req, res) => {
  try {
    const { id } = req.params; // User id to unfollow
    const currentUserId = req.user; // Authenticated user id

    // Update current user's following array
    const currentUser = await User.findById(currentUserId);
    currentUser.following = currentUser.following.filter(
      userId => userId.toString() !== id
    );
    await currentUser.save();

    // Update target user's followers array
    const userToUnfollow = await User.findById(id);
    if (userToUnfollow) {
      userToUnfollow.followers = userToUnfollow.followers.filter(
        userId => userId.toString() !== currentUserId
      );
      await userToUnfollow.save();
    }

    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error unfollowing user', error: error.message });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params; // User id from params

    // Fetch user by id (exclude password)
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch posts created by this user
    const posts = await Post.find({ user: id })
      .sort({ createdAt: -1 })
      .populate('user', 'username');

    // Return user info and posts
    res.status(200).json({
      user,
      posts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getUserProfile
};

