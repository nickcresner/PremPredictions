// User management and role system
// Handles user authentication, roles, and permissions

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin', 
  USER: 'user'
};

export const PERMISSIONS = {
  CREATE_CHALLENGES: 'create_challenges',
  MANAGE_USERS: 'manage_users',
  VIEW_ADMIN_DASHBOARD: 'view_admin_dashboard',
  EDIT_PREDICTIONS: 'edit_predictions',
  MANAGE_ROLES: 'manage_roles',
  DELETE_CHALLENGES: 'delete_challenges',
  VIEW_ANALYTICS: 'view_analytics'
};

// Role permissions mapping
const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.CREATE_CHALLENGES,
    PERMISSIONS.VIEW_ADMIN_DASHBOARD,
    PERMISSIONS.EDIT_PREDICTIONS,
    PERMISSIONS.VIEW_ANALYTICS
  ],
  [USER_ROLES.USER]: []
};

// Mock user database - in production this would be in a real database
let USERS = [
  {
    id: 1,
    name: 'Nick',
    email: 'nick@barnbowl.com',
    role: USER_ROLES.SUPER_ADMIN,
    avatar: null,
    joinedDate: '2025-08-01',
    predictions: [],
    stats: {
      totalPoints: 0,
      challengesCompleted: 0,
      perfectPredictions: 0
    }
  },
  {
    id: 2,
    name: 'Sarah',
    email: 'sarah@example.com',
    role: USER_ROLES.USER,
    avatar: null,
    joinedDate: '2025-08-15',
    predictions: [],
    stats: {
      totalPoints: 0,
      challengesCompleted: 0,
      perfectPredictions: 0
    }
  },
  {
    id: 3,
    name: 'Mike',
    email: 'mike@example.com',
    role: USER_ROLES.USER,
    avatar: null,
    joinedDate: '2025-08-20',
    predictions: [],
    stats: {
      totalPoints: 0,
      challengesCompleted: 0,
      perfectPredictions: 0
    }
  }
];

export class UserService {
  constructor() {
    this.currentUser = null;
  }

  // Authenticate user (simplified for demo)
  login(name) {
    const user = USERS.find(u => u.name.toLowerCase() === name.toLowerCase());
    if (user) {
      this.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }
    return null;
  }

  // Get current user from localStorage
  getCurrentUser() {
    if (this.currentUser) return this.currentUser;
    
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      this.currentUser = JSON.parse(stored);
      return this.currentUser;
    }
    
    return null;
  }

  // Logout
  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
  }

  // Get all users (admin only)
  getAllUsers(requestingUser) {
    if (!this.hasPermission(requestingUser, PERMISSIONS.MANAGE_USERS)) {
      throw new Error('Insufficient permissions');
    }
    return USERS;
  }

  // Update user role (super admin only)
  updateUserRole(requestingUserId, targetUserId, newRole) {
    const requestingUser = USERS.find(u => u.id === requestingUserId);
    
    if (requestingUser?.role !== USER_ROLES.SUPER_ADMIN) {
      throw new Error('Only super admins can manage roles');
    }

    const targetUser = USERS.find(u => u.id === targetUserId);
    if (!targetUser) {
      throw new Error('User not found');
    }

    // Prevent changing super admin role
    if (targetUser.role === USER_ROLES.SUPER_ADMIN && requestingUserId !== targetUserId) {
      throw new Error('Cannot change super admin role');
    }

    targetUser.role = newRole;
    
    // Update localStorage if it's the current user
    if (this.currentUser?.id === targetUserId) {
      this.currentUser.role = newRole;
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }

    return targetUser;
  }

  // Create new user
  createUser(userData) {
    const newUser = {
      id: Math.max(...USERS.map(u => u.id)) + 1,
      name: userData.name,
      email: userData.email,
      role: userData.role || USER_ROLES.USER,
      avatar: null,
      joinedDate: new Date().toISOString().split('T')[0],
      predictions: [],
      stats: {
        totalPoints: 0,
        challengesCompleted: 0,
        perfectPredictions: 0
      }
    };

    USERS.push(newUser);
    return newUser;
  }

  // Delete user (super admin only)
  deleteUser(requestingUserId, targetUserId) {
    const requestingUser = USERS.find(u => u.id === requestingUserId);
    
    if (requestingUser?.role !== USER_ROLES.SUPER_ADMIN) {
      throw new Error('Only super admins can delete users');
    }

    const targetUser = USERS.find(u => u.id === targetUserId);
    if (!targetUser) {
      throw new Error('User not found');
    }

    // Prevent deleting super admin
    if (targetUser.role === USER_ROLES.SUPER_ADMIN) {
      throw new Error('Cannot delete super admin');
    }

    // Prevent self-deletion
    if (requestingUserId === targetUserId) {
      throw new Error('Cannot delete yourself');
    }

    USERS = USERS.filter(u => u.id !== targetUserId);
    return true;
  }

  // Check if user has specific permission
  hasPermission(user, permission) {
    if (!user || !user.role) return false;
    
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission);
  }

  // Check if user has any admin privileges
  isAdmin(user) {
    return user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPER_ADMIN;
  }

  // Check if user is super admin
  isSuperAdmin(user) {
    return user?.role === USER_ROLES.SUPER_ADMIN;
  }

  // Get user statistics
  getUserStats(userId) {
    const user = USERS.find(u => u.id === userId);
    return user?.stats || null;
  }

  // Update user statistics
  updateUserStats(userId, stats) {
    const user = USERS.find(u => u.id === userId);
    if (user) {
      user.stats = { ...user.stats, ...stats };
      
      // Update localStorage if it's the current user
      if (this.currentUser?.id === userId) {
        this.currentUser.stats = user.stats;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      }
      
      return user.stats;
    }
    return null;
  }

  // Search users by name
  searchUsers(query, requestingUser) {
    if (!this.hasPermission(requestingUser, PERMISSIONS.MANAGE_USERS)) {
      throw new Error('Insufficient permissions');
    }
    
    const lowerQuery = query.toLowerCase();
    return USERS.filter(user => 
      user.name.toLowerCase().includes(lowerQuery) ||
      user.email.toLowerCase().includes(lowerQuery)
    );
  }

  // Get role display name
  getRoleDisplayName(role) {
    const roleNames = {
      [USER_ROLES.SUPER_ADMIN]: 'Super Admin',
      [USER_ROLES.ADMIN]: 'Admin',
      [USER_ROLES.USER]: 'User'
    };
    return roleNames[role] || 'Unknown';
  }

  // Get role color
  getRoleColor(role) {
    const roleColors = {
      [USER_ROLES.SUPER_ADMIN]: 'bg-red-100 text-red-800',
      [USER_ROLES.ADMIN]: 'bg-blue-100 text-blue-800',
      [USER_ROLES.USER]: 'bg-gray-100 text-gray-800'
    };
    return roleColors[role] || roleColors[USER_ROLES.USER];
  }

  // Get user leaderboard
  getLeaderboard(limit = 10) {
    return USERS
      .sort((a, b) => (b.stats?.totalPoints || 0) - (a.stats?.totalPoints || 0))
      .slice(0, limit)
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }));
  }

  // Bulk role update
  bulkUpdateRoles(requestingUserId, updates) {
    const requestingUser = USERS.find(u => u.id === requestingUserId);
    
    if (requestingUser?.role !== USER_ROLES.SUPER_ADMIN) {
      throw new Error('Only super admins can bulk update roles');
    }

    const results = [];
    for (const update of updates) {
      try {
        const updatedUser = this.updateUserRole(requestingUserId, update.userId, update.role);
        results.push({ success: true, user: updatedUser });
      } catch (error) {
        results.push({ success: false, error: error.message, userId: update.userId });
      }
    }

    return results;
  }

  // Activity log (simplified)
  logActivity(userId, action, details = {}) {
    const activity = {
      id: Date.now(),
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    };

    // In production, this would be stored in a database
    console.log('User activity:', activity);
    return activity;
  }

  // Export user data (GDPR compliance)
  exportUserData(requestingUserId, targetUserId) {
    const requestingUser = USERS.find(u => u.id === requestingUserId);
    const targetUser = USERS.find(u => u.id === targetUserId);

    // Users can export their own data, admins can export any data
    if (requestingUserId !== targetUserId && !this.isAdmin(requestingUser)) {
      throw new Error('Insufficient permissions');
    }

    if (!targetUser) {
      throw new Error('User not found');
    }

    return {
      exportedAt: new Date().toISOString(),
      user: targetUser,
      predictions: targetUser.predictions || [],
      activityLog: [] // Would include real activity log in production
    };
  }
}

export const userService = new UserService();