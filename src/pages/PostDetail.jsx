import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);

  // Fetch post by id
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/posts/${id}`);
        const postData = response.data.post;
        setPost(postData);
        
        // Set likes state
        setLikesCount(postData.likes?.length || 0);
        if (currentUser?.id && postData.likes) {
          const liked = postData.likes.some(
            like => like.toString() === currentUser.id.toString()
          );
          setIsLiked(liked);
        }
        
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load post');
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id, currentUser?.id]);

  // Handle like/unlike
  const handleLike = async () => {
    if (likeLoading) return;
    
    setLikeLoading(true);
    try {
      if (isLiked) {
        await api.post(`/posts/${id}/unlike`);
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        await api.post(`/posts/${id}/like`);
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
      // Refresh post to get updated data
      const response = await api.get(`/posts/${id}`);
      setPost(response.data.post);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLikeLoading(false);
    }
  };

  // Handle comment submit
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || commentLoading) return;

    setCommentLoading(true);
    try {
      await api.post(`/posts/${id}/comment`, { text: commentText });
      
      // Refresh post to get updated comments
      const response = await api.get(`/posts/${id}`);
      setPost(response.data.post);
      
      // Clear comment input
      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600">Loading post...</div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || 'Post not found'}
          </div>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-indigo-600 hover:text-indigo-700"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  const username = post.user?.username || 'Unknown';
  const comments = post.comments || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="mb-4 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          ← Back to Home
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
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
                disabled={likeLoading}
                className={`transition-colors cursor-pointer active:scale-95 ${
                  isLiked
                    ? 'text-red-500 hover:text-red-600'
                    : 'text-gray-400 hover:text-red-500'
                } ${likeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              <div className="mb-4">
                <span className="font-semibold text-gray-800 mr-2">{username}</span>
                <span className="text-gray-700">{post.caption}</span>
              </div>
            )}

            {/* Comments section */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">
                Comments ({comments.length})
              </h4>
              
              {/* Comments list */}
              {comments.length === 0 ? (
                <p className="text-gray-500 text-sm">No comments yet.</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {comments.map((comment, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="font-semibold text-gray-800 text-sm">
                        {comment.user?.username || 'User'}:
                      </span>
                      <span className="text-gray-700 text-sm flex-1">
                        {comment.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Add comment form */}
              <form onSubmit={handleCommentSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={commentLoading}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || commentLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {commentLoading ? 'Posting...' : 'Post'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;

