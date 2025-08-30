import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InviteLink from './InviteLink';

function AdminDashboard({ currentUser }) {
  const [predictions, setPredictions] = useState([]);
  const [users, setUsers] = useState([]);
  const [systemSettings, setSystemSettings] = useState({
    predictionsLocked: false,
    deadline: '2025-08-31T23:00:00'
  });
  const [loading, setLoading] = useState(true);
  const [editingPrediction, setEditingPrediction] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [predictionsRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5001/api/predictions'),
        axios.get('http://localhost:5001/api/users')
      ]);
      setPredictions(predictionsRes.data);
      setUsers(usersRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const togglePredictionsLock = async () => {
    const newLockState = !systemSettings.predictionsLocked;
    setSystemSettings(prev => ({ ...prev, predictionsLocked: newLockState }));
    // Here you would make an API call to update the system settings
  };

  const resetUserPredictions = async (userId) => {
    if (window.confirm('Are you sure you want to reset this user\'s predictions?')) {
      try {
        await axios.delete(`http://localhost:5001/api/predictions/user/${userId}`);
        fetchData();
        alert('User predictions reset successfully');
      } catch (error) {
        alert('Error resetting predictions: ' + error.message);
      }
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5001/api/users/${userId}`);
        fetchData();
        alert('User deleted successfully');
      } catch (error) {
        alert('Error deleting user: ' + error.message);
      }
    }
  };

  const updatePrediction = async (prediction, newData) => {
    try {
      await axios.put(`http://localhost:5001/api/predictions/${prediction._id}`, newData);
      fetchData();
      setEditingPrediction(null);
      alert('Prediction updated successfully');
    } catch (error) {
      alert('Error updating prediction: ' + error.message);
    }
  };

  const handlePhotoUpload = async (userId, file) => {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('userId', userId);

    try {
      setUploadingPhoto(userId);
      await axios.post('http://localhost:5001/api/users/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchData();
      alert('Photo uploaded successfully!');
    } catch (error) {
      alert('Error uploading photo: ' + error.message);
    } finally {
      setUploadingPhoto(null);
    }
  };

  if (loading) return <div className="text-center py-8">Loading admin dashboard...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-red-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">🔧 Admin Dashboard</h1>
        <p className="text-red-100">Manage users, predictions, and system settings</p>
      </div>

      {/* System Controls */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">System Controls</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Predictions Status</span>
              <button 
                onClick={togglePredictionsLock}
                className={`px-4 py-2 rounded font-semibold ${
                  systemSettings.predictionsLocked 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {systemSettings.predictionsLocked ? '🔒 Locked' : '🔓 Unlocked'}
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline
              </label>
              <input 
                type="datetime-local" 
                value={systemSettings.deadline}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, deadline: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Users:</span>
              <span className="font-semibold">{users.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Predictions:</span>
              <span className="font-semibold">{predictions.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Complete Predictions:</span>
              <span className="font-semibold">
                {predictions.filter(p => p.topEight.length === 8 && p.bottomThree.length === 3).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">User Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Predictions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const userPrediction = predictions.find(p => p.user?.name === user.name);
                return (
                  <tr key={user._id || user.name}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                          {user.photo ? (
                            <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-gray-600">{user.name[0]}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {userPrediction ? (
                        <span className="text-green-600 font-medium">Complete</span>
                      ) : (
                        <span className="text-red-600 font-medium">Incomplete</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold">{user.points || 0}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <div className="flex flex-col space-y-1">
                        <div className="space-x-2">
                          {userPrediction && (
                            <button 
                              onClick={() => setEditingPrediction(userPrediction)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Edit
                            </button>
                          )}
                          <button 
                            onClick={() => resetUserPredictions(user._id)}
                            className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                          >
                            Reset
                          </button>
                          <button 
                            onClick={() => deleteUser(user._id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            id={`photo-${user._id}`}
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                handlePhotoUpload(user._id, e.target.files[0]);
                              }
                            }}
                          />
                          <label
                            htmlFor={`photo-${user._id}`}
                            className={`text-xs cursor-pointer px-2 py-1 rounded ${
                              uploadingPhoto === user._id 
                                ? 'bg-gray-300 text-gray-500' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {uploadingPhoto === user._id ? 'Uploading...' : '📷 Photo'}
                          </label>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Friends Section */}
      <div className="mt-8">
        <InviteLink />
      </div>

      {/* Edit Prediction Modal */}
      {editingPrediction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Edit Prediction - {editingPrediction.user?.name}
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Top 8:</h4>
                {editingPrediction.topEight.map((item, i) => (
                  <div key={i} className="text-sm">
                    {i + 1}. {item.team}
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-medium mb-2">Bottom 3:</h4>
                {editingPrediction.bottomThree.map((item, i) => (
                  <div key={i} className="text-sm">
                    {i + 18}. {item.team}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setEditingPrediction(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  // Here you would implement the actual editing logic
                  alert('Full edit functionality would be implemented here');
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;