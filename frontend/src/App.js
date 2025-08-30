import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Predictions from './components/Predictions';
import Leaderboard from './components/Leaderboard';
import InteractiveWeeklyChallenge from './components/InteractiveWeeklyChallenge';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import RulesAndGuide from './components/RulesAndGuide';
import UserManagement from './components/UserManagement';
import AdminChallengeCreator from './components/AdminChallengeCreator';
import { userService } from './services/userService';
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

  useEffect(() => {
    // Initialize user - Nick is automatically super admin
    const user = userService.login('Nick');
    setCurrentUser(user);
  }, []);

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
            </div>
          </div>
        </div>
      </header>

      <Navigation currentUser={currentUser} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<Leaderboard currentUser={currentUser} />} />
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
    </Router>
  );
}

export default App;