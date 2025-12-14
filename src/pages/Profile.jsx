import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Check if viewing own profile
  const isOwnProfile = currentUser?.id === id;

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/users/${id}`);
        setProfile(response.data.user);
        setPosts(response.data.posts || []);
        
        // Check if current user is following this profile
        if (currentUser?.id && response.data.user.followers) {
          const following = response.data.user.followers.some(
            follower => follower.toString() === currentUser.id
          );
          setIsFollowing(following);
        }
        
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id, currentUser?.id]);

  // Handle follow/unfollow
  const handleFollow = async () => {
    if (followLoading || !currentUser?.id) return;
    
    setFollowLoading(true);
    const previousState = isFollowing;
    const previousFollowers = profile.followers;
    
    try {
      if (isFollowing) {
        // Unfollow
        await api.post(`/users/${id}/unfollow`);
        setIsFollowing(false);
        // Update follower count without refresh
        setProfile(prev => ({
          ...prev,
          followers: prev.followers.filter(
            f => f.toString() !== currentUser.id.toString()
          )
        }));
      } else {
        // Follow
        await api.post(`/users/${id}/follow`);
        setIsFollowing(true);
        // Update follower count without refresh
        setProfile(prev => ({
          ...prev,
          followers: [...prev.followers, currentUser.id]
        }));
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
      // Revert state on error
      setIsFollowing(previousState);
      setProfile(prev => ({
        ...prev,
        followers: previousFollowers
      }));
    } finally {
      setFollowLoading(false);
    }
  };

  // Refresh posts after like/unlike
  const handlePostUpdate = async () => {
    try {
      const response = await api.get(`/users/${id}`);
      setPosts(response.data.posts || []);
    } catch (err) {
      console.error('Error refreshing posts:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600">User not found</div>
        </div>
      </div>
    );
  }

  const followersCount = profile.followers?.length || 0;
  const followingCount = profile.following?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">
                {profile.username}
              </h1>
              
              {/* Stats */}
              <div className="flex justify-center md:justify-start space-x-6 mb-4">
                <div>
                  <span className="font-semibold text-gray-800">{posts.length}</span>
                  <span className="text-gray-600 ml-1">posts</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-800">{followersCount}</span>
                  <span className="text-gray-600 ml-1">followers</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-800">{followingCount}</span>
                  <span className="text-gray-600 ml-1">following</span>
                </div>
              </div>

              {/* Follow/Unfollow Button */}
              {!isOwnProfile && (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {followLoading
                    ? 'Loading...'
                    : isFollowing
                    ? 'Unfollow'
                    : 'Follow'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">
            <p>No posts yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} onUpdate={handlePostUpdate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

