import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import api from '../services/api';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch feed posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/posts/feed');
        setPosts(response.data.posts || []);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load posts');
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Function to refresh posts after like/unlike
  const handlePostUpdate = async () => {
    try {
      const response = await api.get('/posts/feed');
      setPosts(response.data.posts || []);
    } catch (err) {
      console.error('Error refreshing posts:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-600">Loading posts...</div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <p>No posts to display. Follow some users to see their posts!</p>
          </div>
        ) : (
          <div>
            {posts.map((post) => (
              <PostCard key={post._id} post={post} onUpdate={handlePostUpdate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

