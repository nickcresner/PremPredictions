import React, { useState, useEffect } from 'react';
import { userService, USER_ROLES } from '../services/userService';

function UserManagement({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: USER_ROLES.USER });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const allUsers = userService.getAllUsers(currentUser);
      setUsers(allUsers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateUserRole(currentUser.id, userId, newRole);
      fetchUsers(); // Refresh the list
      alert('User role updated successfully!');
    } catch (error) {
      alert('Error updating role: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await userService.deleteUser(currentUser.id, userId);
      fetchUsers(); // Refresh the list
      alert('User deleted successfully!');
    } catch (error) {
      alert('Error deleting user: ' + error.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await userService.createUser(newUser);
      setNewUser({ name: '', email: '', role: USER_ROLES.USER });
      setShowCreateUser(false);
      fetchUsers();
      alert('User created successfully!');
    } catch (error) {
      alert('Error creating user: ' + error.message);
    }
  };

  const handleBulkRoleUpdate = async (role) => {
    if (selectedUsers.length === 0) {
      alert('Please select users to update');
      return;
    }

    try {
      const updates = selectedUsers.map(userId => ({ userId, role }));
      await userService.bulkUpdateRoles(currentUser.id, updates);
      setSelectedUsers([]);
      fetchUsers();
      alert('Bulk role update completed!');
    } catch (error) {
      alert('Error updating roles: ' + error.message);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">👥</div>
          <div className="text-lg font-semibold text-gray-700">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">👥 User Management</h2>
            <p className="text-blue-100">Manage user roles and permissions</p>
          </div>
          {userService.isSuperAdmin(currentUser) && (
            <button
              onClick={() => setShowCreateUser(true)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              ➕ Add User
            </button>
          )}
        </div>
      </div>

      {/* Search and Bulk Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {userService.isSuperAdmin(currentUser) && selectedUsers.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600">
                {selectedUsers.length} selected
              </span>
              <button
                onClick={() => handleBulkRoleUpdate(USER_ROLES.ADMIN)}
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Make Admin
              </button>
              <button
                onClick={() => handleBulkRoleUpdate(USER_ROLES.USER)}
                className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
              >
                Make User
              </button>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                {userService.isSuperAdmin(currentUser) && (
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map(u => u.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      checked={selectedUsers.length === filteredUsers.length}
                      className="rounded"
                    />
                  </th>
                )}
                <th className="px-4 py-3 text-left font-semibold text-gray-900">User</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Role</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Stats</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Joined</th>
                {userService.isSuperAdmin(currentUser) && (
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  {userService.isSuperAdmin(currentUser) && (
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        disabled={user.role === USER_ROLES.SUPER_ADMIN}
                        className="rounded"
                      />
                    </td>
                  )}
                  
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">
                        {user.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-4">
                    {userService.isSuperAdmin(currentUser) && user.role !== USER_ROLES.SUPER_ADMIN ? (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm font-medium border-0 ${userService.getRoleColor(user.role)}`}
                      >
                        <option value={USER_ROLES.USER}>User</option>
                        <option value={USER_ROLES.ADMIN}>Admin</option>
                      </select>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${userService.getRoleColor(user.role)}`}>
                        {userService.getRoleDisplayName(user.role)}
                      </span>
                    )}
                  </td>
                  
                  <td className="px-4 py-4">
                    <div className="text-sm">
                      <div className="font-semibold text-primary-600">{user.stats?.totalPoints || 0} pts</div>
                      <div className="text-gray-500">{user.stats?.challengesCompleted || 0} challenges</div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {new Date(user.joinedDate).toLocaleDateString()}
                  </td>
                  
                  {userService.isSuperAdmin(currentUser) && (
                    <td className="px-4 py-4">
                      {user.role !== USER_ROLES.SUPER_ADMIN && user.id !== currentUser.id && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
            <div className="text-lg font-semibold text-gray-900 mb-2">No users found</div>
            <div className="text-gray-500">Try adjusting your search query</div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Create New User</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={USER_ROLES.USER}>User</option>
                  <option value={USER_ROLES.ADMIN}>Admin</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateUser(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">📊 User Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            <div className="text-sm text-blue-700">Total Users</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.role === USER_ROLES.ADMIN).length}
            </div>
            <div className="text-sm text-green-700">Admins</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.stats?.challengesCompleted > 0).length}
            </div>
            <div className="text-sm text-purple-700">Active Users</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {users.reduce((sum, u) => sum + (u.stats?.totalPoints || 0), 0)}
            </div>
            <div className="text-sm text-yellow-700">Total Points</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;