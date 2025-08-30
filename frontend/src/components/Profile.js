import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Profile({ currentUser }) {
  const [userProfile, setUserProfile] = useState({
    name: currentUser,
    email: '',
    points: 0,
    rank: 0,
    joinDate: '2025-01-01'
  });
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Fetch user profile and prediction history
      const [profileRes, historyRes] = await Promise.all([
        axios.get(`http://localhost:5001/api/users/${currentUser}`),
        axios.get(`http://localhost:5001/api/predictions/history/${currentUser}`)
      ]);
      
      setUserProfile(profileRes.data);
      setPredictionHistory(historyRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    try {
      await axios.put(`http://localhost:5001/api/users/${currentUser}/password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      alert('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      alert('Error updating password: ' + error.response?.data?.error);
    }
  };

  if (loading) return <div className="text-center py-8">Loading profile...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary-500 text-white p-6 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-2xl font-bold">
            {currentUser[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{userProfile.name}</h1>
            <p className="text-primary-100">
              Rank #{userProfile.rank} • {userProfile.points} points
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'profile', name: 'Profile', icon: '👤' },
            { id: 'history', name: 'Prediction History', icon: '📊' },
            { id: 'settings', name: 'Settings', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-gray-900">{userProfile.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{userProfile.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Member Since</label>
                <p className="mt-1 text-gray-900">{new Date(userProfile.joinDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Statistics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Rank</span>
                <span className="text-2xl font-bold text-primary-600">#{userProfile.rank}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Points</span>
                <span className="text-2xl font-bold text-green-600">{userProfile.points}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Predictions Made</span>
                <span className="text-lg font-semibold">{predictionHistory.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Weekly Challenges</span>
                <span className="text-lg font-semibold">{userProfile.weeklyCompleted || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Prediction History</h2>
          </div>
          <div className="p-6">
            {predictionHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">📈</div>
                <p>No prediction history yet!</p>
                <p className="text-sm">Make your first prediction to see it here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {predictionHistory.map((prediction, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold">Season {prediction.season}</h3>
                      <span className="text-sm text-gray-500">
                        {new Date(prediction.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-600 mb-2">Top 4:</h4>
                        {prediction.topEight.slice(0, 4).map((team, i) => (
                          <div key={i} className="text-sm flex items-center space-x-2">
                            <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {i + 1}
                            </span>
                            <span>{team.team}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-gray-600 mb-2">Relegation:</h4>
                        {prediction.bottomThree.map((team, i) => (
                          <div key={i} className="text-sm flex items-center space-x-2">
                            <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {i + 18}
                            </span>
                            <span>{team.team}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-sm font-medium text-green-600">
                        Points Earned: {prediction.pointsEarned || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
          
          <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
            <h3 className="text-lg font-medium">Change Password</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                minLength={6}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                minLength={6}
              />
            </div>
            
            <button
              type="submit"
              className="bg-primary-500 text-white px-6 py-2 rounded hover:bg-primary-600 transition-colors"
            >
              Update Password
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Profile;