import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import Predictions from './components/Predictions';
import Leaderboard from './components/Leaderboard';
import InteractiveWeeklyChallenge from './components/InteractiveWeeklyChallenge';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import RulesAndGuide from './components/RulesAndGuide';
import UserManagement from './components/UserManagement';
import AdminChallengeCreator from './components/AdminChallengeCreator';
import { userService, USER_ROLES } from './services/userService';
import './App.css';

function Navigation({ currentUser }) {
  const location = useLocation();
  
  const navItems = [
    { path: '/', name: 'Leaderboard', icon: '🏆', description: 'Rankings' },
    { path: '/predictions', name: 'Predictions', icon: '📊', description: 'Season Forecast' },
    { path: '/challenge', name: 'Weekly Challenge', icon: '🎯', description: 'Mini Games' },
    { path: '/rules', name: 'Rules & Guide', icon: '📋', description: 'How to Play' },
    { path: '/profile', name: 'Profile', icon: '👤', description: 'Your Account' },
  ];

  if (userService.isAdmin(currentUser)) {
    navItems.push(
      { path: '/admin', name: 'Admin', icon: '🔧', description: 'Dashboard' },
      { path: '/admin/challenges', name: 'Create Challenge', icon: '🎯', description: 'Weekly Setup' }
    );
  }

  if (userService.isSuperAdmin(currentUser)) {
    navItems.push({ path: '/admin/users', name: 'Users', icon: '👥', description: 'User Management' });
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex space-x-1 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`py-4 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-primary-500 text-primary-600 bg-primary-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <div>
                  <div>{item.name}</div>
                  <div className="text-xs text-gray-400">{item.description}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  const [currentUser, setCurrentUser] = useState(null);

  const [showJoin, setShowJoin] = useState(false);
  const [joinName, setJoinName] = useState('');
  const [joinTeam, setJoinTeam] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Load from localStorage if available
    const stored = localStorage.getItem('currentUser');

    // Support quick testing via query params
    const params = new URLSearchParams(window.location.search);
    const forceJoin = params.get('join') === '1' || params.get('join') === 'true';
    const reset = params.get('reset') === '1' || params.get('reset') === 'true';

    if (reset) {
      try {
        localStorage.removeItem('currentUser');
        // Clear any saved prediction flags
        Object.keys(localStorage)
          .filter((k) => k.startsWith('predictionSaved:'))
          .forEach((k) => localStorage.removeItem(k));
      } catch (_) {}
      // Remove the query param and reload cleanly
      params.delete('reset');
      const next = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
      window.location.replace(next);
      return;
    }

    if (stored && !forceJoin) {
      setCurrentUser(JSON.parse(stored));
    } else {
      setShowJoin(true);
    }
  }, []);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinName.trim()) return;
    try {
      // Create or fetch user in backend
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: joinName.trim(), team: joinTeam })
      });
      const user = await res.json();
      // Make Nick super admin for testing
      const isSuperAdmin = user.name && user.name.trim().toLowerCase() === 'nick';
      const newUser = { name: user.name, team: user.team, role: isSuperAdmin ? USER_ROLES.SUPER_ADMIN : USER_ROLES.USER };
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      setCurrentUser(newUser);
      setShowJoin(false);
      // Send them straight to predictions onboarding
      navigate('/predictions', { state: { onboarding: true } });
    } catch (err) {
      console.error('Join error:', err);
      alert('Could not create user. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary-500 text-white py-6">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
                <div className="text-3xl">🏆</div>
                <div>
                  <h1 className="text-2xl font-bold">BARNBOWL</h1>
                  <p className="text-primary-100 text-sm">PremPredictions 2025/26</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <>
                  <div className="text-sm">
                    <span className="text-accent font-medium">{currentUser?.name}</span>
                    <span className={`ml-2 text-xs px-2 py-1 rounded ${userService.getRoleColor(currentUser?.role)}`}>
                      {userService.getRoleDisplayName(currentUser?.role)}
                    </span>
                  </div>
                  <Link
                    to="/profile"
                    className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-lg font-bold hover:bg-primary-700 transition-colors"
                  >
                    {currentUser?.name?.[0] || 'U'}
                  </Link>
                  <button
                    onClick={() => {
                      try {
                        localStorage.removeItem('currentUser');
                        Object.keys(localStorage)
                          .filter((k) => k.startsWith('predictionSaved:'))
                          .forEach((k) => localStorage.removeItem(k));
                      } catch (_) {}
                      setCurrentUser(null);
                      setShowJoin(true);
                      navigate('/');
                    }}
                    className="hidden sm:block bg-white text-primary-700 px-3 py-2 rounded hover:bg-gray-100"
                    title="Sign out / Switch user"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowJoin(true)}
                  className="bg-white text-primary-600 px-4 py-2 rounded font-semibold"
                >
                  Join
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {showJoin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Join the League</h3>
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Nick"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Favorite Team (optional)</label>
                <input
                  type="text"
                  value={joinTeam}
                  onChange={(e) => setJoinTeam(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Spurs"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600"
                >
                  Join
                </button>
                <button
                  type="button"
                  onClick={() => setShowJoin(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Navigation currentUser={currentUser} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<Leaderboard currentUser={currentUser?.name} />} />
          <Route path="/predictions" element={<Predictions currentUser={currentUser?.name} />} />
          <Route path="/challenge" element={<InteractiveWeeklyChallenge currentUser={currentUser?.name} />} />
          <Route path="/rules" element={<RulesAndGuide currentUser={currentUser?.name} isAdmin={userService.isAdmin(currentUser)} />} />
          <Route path="/profile" element={<Profile currentUser={currentUser?.name} />} />
          {userService.isAdmin(currentUser) && (
            <>
              <Route path="/admin" element={<AdminDashboard currentUser={currentUser?.name} />} />
              <Route path="/admin/challenges" element={<AdminChallengeCreator currentUser={currentUser?.name} />} />
            </>
          )}
          {userService.isSuperAdmin(currentUser) && (
            <Route path="/admin/users" element={<UserManagement currentUser={currentUser} />} />
          )}
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
              <span className="text-2xl">⚽</span>
              <span className="text-sm text-gray-400">Premier League Predictions 2025/26</span>
            </div>
            <div className="text-xs text-gray-500">
              Powered by passion & predictions
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
      {/* Simple Join Modal */}
      {/* Using a portal-less inline modal for simplicity */}
      {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
      <div>
        {/* This is rendered by AppContent state; we can’t lift easily without context */}
      </div>
    </Router>
  );
}

export default App;
