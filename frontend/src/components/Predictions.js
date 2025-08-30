import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LEAGUE_PREDICTION_POINTS } from '../utils/scoringSystem';
import OddsDisplay from './OddsDisplay';
import './Predictions.css';

const TEAMS = [
  'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton',
  'Burnley', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham',
  'Leeds United', 'Liverpool', 'Man City', 'Man United', 'Newcastle',
  'Nottingham Forest', 'Sunderland', 'Spurs', 'West Ham', 'Wolves'
];

function Predictions({ currentUser }) {
  const [predictions, setPredictions] = useState([]);
  const [myPrediction, setMyPrediction] = useState({
    topEight: Array(8).fill(''),
    bottomThree: Array(3).fill(''),
    favoriteTeam: ''
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPredictions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPredictions = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/predictions');
      setPredictions(response.data);
      
      // Find current user's prediction
      const mine = response.data.find(p => p.user?.name === currentUser);
      if (mine) {
        setMyPrediction({
          topEight: mine.topEight.map(t => t.team),
          bottomThree: mine.bottomThree.map(t => t.team),
          favoriteTeam: mine.favoriteTeam || ''
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const formattedPrediction = {
        userName: currentUser,
        favoriteTeam: myPrediction.favoriteTeam,
        topEight: myPrediction.topEight.map((team, i) => ({
          position: i + 1,
          team,
          odds: 0 // We'll add odds later
        })),
        bottomThree: myPrediction.bottomThree.map((team, i) => ({
          position: i + 18,
          team,
          odds: 0
        }))
      };

      await axios.post('http://localhost:5001/api/predictions', formattedPrediction);
      alert('Prediction saved!');
      setEditing(false);
      fetchPredictions();
    } catch (error) {
      alert('Error saving prediction: ' + error.response?.data?.error);
    }
  };

  const updatePosition = (section, index, team) => {
    if (section === 'favoriteTeam') {
      setMyPrediction(prev => ({
        ...prev,
        favoriteTeam: team
      }));
    } else {
      setMyPrediction(prev => ({
        ...prev,
        [section]: prev[section].map((t, i) => i === index ? team : t)
      }));
    }
  };

  // Get available teams for a specific dropdown (excluding already selected teams)
  const getAvailableTeams = (currentSection, currentIndex) => {
    const allSelected = [
      ...myPrediction.topEight,
      ...myPrediction.bottomThree
    ].filter(team => team !== ''); // Remove empty selections
    
    const currentTeam = currentSection === 'topEight' 
      ? myPrediction.topEight[currentIndex]
      : myPrediction.bottomThree[currentIndex];
    
    // Include the current team (so user can keep their selection) but exclude all others
    return TEAMS.filter(team => 
      team === currentTeam || !allSelected.includes(team)
    );
  };

  if (loading) return <div className="text-center py-8">Loading predictions...</div>;

  const isLocked = false; // Always allow editing for now
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">League Predictions - Season 2025/26</h2>
        <p className="text-gray-600">Make your predictions for the Premier League season</p>
      </div>
      
      {!isLocked && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <span className="text-xl mr-3">⏰</span>
            <div>
              <p className="font-medium text-yellow-800">Deadline: August 31st, 2025</p>
              <p className="text-sm text-yellow-700">Predictions lock on Transfer Deadline Day</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg">
          <div className="bg-primary-500 text-white p-4 rounded-t-lg">
            <h3 className="text-lg font-semibold">My Predictions - {currentUser}</h3>
          </div>
          
          <div className="p-6">
            {editing ? (
              <div className="space-y-6">
                {/* Favorite Team Selection */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    ❤️ Choose Your Favorite Team
                  </h4>
                  <p className="text-sm text-yellow-800 mb-3">
                    Select your favorite team to get <strong>score multipliers</strong> - both positive and negative! 
                    When they do well, your points are boosted. When they disappoint, you lose extra points.
                  </p>
                  <select 
                    value={myPrediction.favoriteTeam} 
                    onChange={(e) => updatePosition('favoriteTeam', 0, e.target.value)}
                    className="w-full p-3 border border-yellow-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
                  >
                    <option value="">No favorite team selected</option>
                    {TEAMS.map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                  {myPrediction.favoriteTeam && (
                    <div className="mt-2 text-sm text-yellow-700">
                      <strong>{myPrediction.favoriteTeam}</strong> selected! Your scores will be multiplied by their performance.
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Top 8</h4>
                  <div className="space-y-3">
                    {myPrediction.topEight.map((team, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </span>
                        <select 
                          value={team} 
                          onChange={(e) => updatePosition('topEight', i, e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">Select team...</option>
                          {getAvailableTeams('topEight', i).map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Bottom 3 (Relegation)</h4>
                  <div className="space-y-3">
                    {myPrediction.bottomThree.map((team, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <span className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {i + 18}
                        </span>
                        <select 
                          value={team} 
                          onChange={(e) => updatePosition('bottomThree', i, e.target.value)}
                          className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">Select team...</option>
                          {getAvailableTeams('bottomThree', i).map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button 
                    onClick={handleSubmit} 
                    className="bg-primary-500 text-white px-6 py-2 rounded hover:bg-primary-600 transition-colors"
                  >
                    Save Prediction
                  </button>
                  <button 
                    onClick={() => setEditing(false)} 
                    className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Favorite Team Display */}
                {myPrediction.favoriteTeam && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                      ❤️ Your Favorite Team
                    </h4>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">
                        {myPrediction.favoriteTeam.split(' ').map(w => w[0]).join('')}
                      </div>
                      <div>
                        <div className="font-bold text-lg text-yellow-800">{myPrediction.favoriteTeam}</div>
                        <div className="text-sm text-yellow-700">Score multiplier active! 📈📉</div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Top 8</h4>
                  <div className="space-y-2">
                    {myPrediction.topEight.map((team, i) => (
                      <div key={i} className="flex items-center space-x-3 py-2">
                        <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </span>
                        <span className="text-gray-700">
                          {team || <span className="text-gray-400 italic">No selection</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Bottom 3 (Relegation)</h4>
                  <div className="space-y-2">
                    {myPrediction.bottomThree.map((team, i) => (
                      <div key={i} className="flex items-center space-x-3 py-2">
                        <span className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {i + 18}
                        </span>
                        <span className="text-gray-700">
                          {team || <span className="text-gray-400 italic">No selection</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {!isLocked && (
                  <div className="pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => setEditing(true)} 
                      className="bg-primary-500 text-white px-6 py-2 rounded hover:bg-primary-600 transition-colors"
                    >
                      Edit Predictions
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="bg-gray-500 text-white p-4 rounded-t-lg">
            <h3 className="text-lg font-semibold">All Predictions</h3>
          </div>
          
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {predictions.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p>No predictions yet!</p>
                <p className="text-sm">Be the first to make your prediction.</p>
              </div>
            ) : (
              predictions.map((pred) => (
                <div key={pred._id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">{pred.user?.name}</h4>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium mb-1">Top 4:</div>
                    {pred.topEight.slice(0, 4).map((t, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        <span>{t.team}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Live Odds Display */}
      <OddsDisplay showSummary={true} />

      {/* Scoring System Explanation */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">🏆 How Scoring Works</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">League Predictions</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Perfect position:</span>
                <span className="font-semibold text-green-600">{LEAGUE_PREDICTION_POINTS.EXACT_POSITION} pts</span>
              </div>
              <div className="flex justify-between">
                <span>1 position off:</span>
                <span className="font-semibold text-blue-600">{LEAGUE_PREDICTION_POINTS.OFF_BY_ONE} pts</span>
              </div>
              <div className="flex justify-between">
                <span>2 positions off:</span>
                <span className="font-semibold text-yellow-600">{LEAGUE_PREDICTION_POINTS.OFF_BY_TWO} pts</span>
              </div>
              <div className="flex justify-between">
                <span>3 positions off:</span>
                <span className="font-semibold text-orange-600">{LEAGUE_PREDICTION_POINTS.OFF_BY_THREE} pts</span>
              </div>
              <div className="flex justify-between">
                <span>Right section:</span>
                <span className="font-semibold text-gray-600">{LEAGUE_PREDICTION_POINTS.CORRECT_SECTION} pts</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">🚀 Live Odds Multipliers</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Astronomical (&lt;0.5%):</span>
                <span className="font-semibold text-purple-700">10x multiplier! 🚀</span>
              </div>
              <div className="flex justify-between">
                <span>Huge surprise (&lt;2%):</span>
                <span className="font-semibold text-purple-600">5x multiplier! ⭐</span>
              </div>
              <div className="flex justify-between">
                <span>Big surprise (&lt;10%):</span>
                <span className="font-semibold text-purple-500">3x multiplier 💫</span>
              </div>
              <div className="flex justify-between">
                <span>Mild surprise (&lt;25%):</span>
                <span className="font-semibold text-purple-400">1.8x multiplier</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <h5 className="font-medium text-yellow-800 mb-2">🏆 Perfect Section Bonuses</h5>
              <div className="space-y-1 text-xs text-yellow-700">
                <div>Perfect Top 8: <span className="font-bold">{LEAGUE_PREDICTION_POINTS.PERFECT_TOP_8} pts</span></div>
                <div>Perfect Top 4: <span className="font-bold">{LEAGUE_PREDICTION_POINTS.PERFECT_TOP_4} pts</span></div>
                <div>Perfect Relegation: <span className="font-bold">{LEAGUE_PREDICTION_POINTS.PERFECT_RELEGATION} pts</span></div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
              <h5 className="font-medium text-red-800 mb-2">❤️ Favorite Team Multipliers</h5>
              <div className="space-y-1 text-xs text-red-700">
                <div>Your favorite team's performance affects <strong>ALL</strong> your points!</div>
                <div>Great Success (+5 pos): <span className="font-bold text-green-700">2.5x</span> | Disaster (-5 pos): <span className="font-bold text-red-800">0.2x</span></div>
                <div className="text-red-600">⚠️ Choose wisely - they can make or break your season!</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">💡 Pro Tip</h4>
          <p className="text-blue-700 text-sm">
            Multipliers are based on LIVE BETTING ODDS! If you think a team will massively outperform 
            their bookmaker expectations, you could earn huge bonus points. The lower the betting probability, 
            the higher your multiplier if you're right!
          </p>
        </div>
      </div>
    </div>
  );
}

export default Predictions;