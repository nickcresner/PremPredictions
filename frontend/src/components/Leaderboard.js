import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WeeklySummary from './WeeklySummary';

function Leaderboard({ currentUser }) {
  const [leaderboardData, setLeaderboardData] = useState({
    overall: [],
    monthly: []
  });
  const [activeTab, setActiveTab] = useState('overall');
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration - would come from API
  const mockData = {
    overall: [
      { rank: 1, name: 'Alice', points: 1250, change: '+2', streak: 5, avatar: '🎯' },
      { rank: 2, name: 'Bob', points: 1180, change: '-1', streak: 3, avatar: '⚽' },
      { rank: 3, name: 'Nick', points: 1150, change: '+1', streak: 7, avatar: '🏆' },
      { rank: 4, name: 'Charlie', points: 1100, change: '0', streak: 2, avatar: '🎲' },
      { rank: 5, name: 'Diana', points: 1050, change: '+3', streak: 4, avatar: '🎪' },
      { rank: 6, name: 'Eve', points: 980, change: '-2', streak: 1, avatar: '🎨' },
      { rank: 7, name: 'Frank', points: 920, change: '0', streak: 2, avatar: '🎭' },
      { rank: 8, name: 'Grace', points: 880, change: '+1', streak: 3, avatar: '🎸' },
    ],
    monthly: [
      { rank: 1, name: 'Nick', points: 320, change: '+5', streak: 7, avatar: '🏆' },
      { rank: 2, name: 'Alice', points: 295, change: '+1', streak: 5, avatar: '🎯' },
      { rank: 3, name: 'Diana', points: 280, change: '+2', streak: 4, avatar: '🎪' },
      { rank: 4, name: 'Bob', points: 275, change: '-1', streak: 3, avatar: '⚽' },
      { rank: 5, name: 'Grace', points: 260, change: '+4', streak: 3, avatar: '🎸' },
      { rank: 6, name: 'Charlie', points: 245, change: '-2', streak: 2, avatar: '🎲' },
      { rank: 7, name: 'Eve', points: 220, change: '+1', streak: 1, avatar: '🎨' },
      { rank: 8, name: 'Frank', points: 195, change: '-1', streak: 2, avatar: '🎭' },
    ]
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      // This would be actual API calls
      // const overallRes = await axios.get('http://localhost:5001/api/leaderboard/overall');
      // const monthlyRes = await axios.get('http://localhost:5001/api/leaderboard/monthly');
      
      // For now, use mock data
      setLeaderboardData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboardData(mockData);
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return rank;
    }
  };

  const getChangeColor = (change) => {
    if (change.startsWith('+')) return 'text-green-600';
    if (change.startsWith('-')) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change) => {
    if (change.startsWith('+')) return '↗️';
    if (change.startsWith('-')) return '↘️';
    return '➡️';
  };

  if (loading) return <div className="text-center py-8">Loading leaderboard...</div>;

  const currentData = leaderboardData[activeTab];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">🏆 Leaderboard</h1>
        <p className="text-yellow-100">See how you stack up against other players</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overall', name: 'Overall Rankings', icon: '🏆' },
              { id: 'monthly', name: 'Monthly Rankings', icon: '📅' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Leaderboard Content */}
        <div className="p-6">
          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {currentData.slice(0, 3).map((player, index) => {
              const positions = [1, 0, 2]; // 2nd, 1st, 3rd positions
              const heights = ['h-24', 'h-32', 'h-20'];
              const actualIndex = positions[index];
              const actualPlayer = currentData[actualIndex];
              
              return (
                <div key={actualPlayer.name} className="text-center">
                  <div className={`${heights[index]} bg-gradient-to-t ${
                    actualIndex === 0 ? 'from-yellow-400 to-yellow-300' :
                    actualIndex === 1 ? 'from-gray-400 to-gray-300' :
                    'from-orange-400 to-orange-300'
                  } rounded-t-lg flex items-end justify-center pb-2`}>
                    <div className="text-white font-bold text-lg">
                      {getRankIcon(actualPlayer.rank)}
                    </div>
                  </div>
                  <div className={`p-3 ${actualPlayer.name === currentUser ? 'bg-primary-50 border-2 border-primary-500' : 'bg-gray-50'} rounded-b-lg`}>
                    <div className="text-2xl mb-1">{actualPlayer.avatar}</div>
                    <div className="font-semibold text-gray-900">{actualPlayer.name}</div>
                    <div className="text-sm text-gray-600">{actualPlayer.points} pts</div>
                    <div className={`text-xs ${getChangeColor(actualPlayer.change)} flex items-center justify-center space-x-1`}>
                      <span>{getChangeIcon(actualPlayer.change)}</span>
                      <span>{actualPlayer.change}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Rankings Table */}
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Full Rankings</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {currentData.map((player) => (
                <div 
                  key={player.name} 
                  className={`px-6 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors ${
                    player.name === currentUser ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold text-gray-600 w-8">
                      {getRankIcon(player.rank)}
                    </div>
                    <div className="text-3xl">{player.avatar}</div>
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center space-x-2">
                        <span>{player.name}</span>
                        {player.name === currentUser && (
                          <span className="text-xs bg-primary-500 text-white px-2 py-1 rounded-full">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {player.streak} week streak 🔥
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">
                      {player.points}
                    </div>
                    <div className={`text-sm font-medium ${getChangeColor(player.change)} flex items-center space-x-1`}>
                      <span>{getChangeIcon(player.change)}</span>
                      <span>{player.change}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {currentData.find(p => p.name === currentUser)?.rank || 'N/A'}
              </div>
              <div className="text-sm text-green-800">Your Rank</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {currentData.find(p => p.name === currentUser)?.points || 0}
              </div>
              <div className="text-sm text-blue-800">Your Points</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {currentData.find(p => p.name === currentUser)?.streak || 0}
              </div>
              <div className="text-sm text-orange-800">Week Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="mt-8">
        <WeeklySummary currentWeek={35} />
      </div>
    </div>
  );
}

export default Leaderboard;