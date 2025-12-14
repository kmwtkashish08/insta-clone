import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PostCard = ({ post, onUpdate }) => {
  const { user: currentUser } = useAuth();
  
  // Check if current user has liked the post
  const checkIfLiked = () => {
    if (!currentUser?.id || !post.likes) return false;
    return post.likes.some(like => {
      const likeId = typeof like === 'object' ? like._id || like : like;
      return likeId.toString() === currentUser.id.toString();
    });
  };

  const [isLiked, setIsLiked] = useState(checkIfLiked());
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [loading, setLoading] = useState(false);

  // Handle like/unlike click
  const handleLike = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      if (isLiked) {
        // Unlike the post
        await api.post(`/posts/${post._id}/unlike`);
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        // Like the post
        await api.post(`/posts/${post._id}/like`);
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
      // Optionally refresh post data
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert state on error
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : Math.max(0, prev - 1));
    } finally {
      setLoading(false);
    }
  };

  const username = post.user?.username || 'Unknown';
  const comments = post.comments || [];
  const firstComment = comments[0];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mb-6"
    >
      {/* Header with username */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">{username}</h3>
      </div>

      {/* Image */}
      <div className="w-full">
        <img
          src={post.imageUrl}
          alt={post.caption || 'Post image'}
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Actions and info */}
      <div className="px-4 py-3">
        {/* Like button and count */}
        <div className="flex items-center space-x-4 mb-2">
          <button
            onClick={handleLike}
            disabled={loading}
            className={`transition-colors cursor-pointer active:scale-95 ${
              isLiked
                ? 'text-red-500 hover:text-red-600'
                : 'text-gray-400 hover:text-red-500'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <svg
              className="w-6 h-6"
              fill={isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
          <span className="text-sm font-semibold text-gray-700">
            {likesCount} {likesCount === 1 ? 'like' : 'likes'}
          </span>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="mb-2">
            <span className="font-semibold text-gray-800 mr-2">{username}</span>
            <span className="text-gray-700">{post.caption}</span>
          </div>
        )}

        {/* Comment preview */}
        {firstComment && (
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-800">
              {firstComment.user?.username || 'User'}
            </span>
            <span className="ml-2">{firstComment.text}</span>
            {comments.length > 1 && (
              <span className="ml-2 text-gray-500">
                View all {comments.length} comments
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PostCard;

