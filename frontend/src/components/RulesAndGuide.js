import React, { useState } from 'react';
import axios from 'axios';
import { LEAGUE_PREDICTION_POINTS, WEEKLY_CHALLENGE_POINTS } from '../utils/scoringSystem';

function RulesAndGuide({ currentUser, isAdmin }) {
  const [ruleSuggestion, setRuleSuggestion] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const submitRuleSuggestion = async () => {
    if (!ruleSuggestion.trim()) return;
    
    try {
      setSubmitting(true);
      // This would be an API call in production
      const newSuggestion = {
        id: Date.now(),
        user: currentUser,
        suggestion: ruleSuggestion,
        timestamp: new Date().toISOString(),
        votes: 0
      };
      
      setSuggestions(prev => [newSuggestion, ...prev]);
      setRuleSuggestion('');
      alert('Rule suggestion submitted! Thanks for helping improve the game for next season.');
    } catch (error) {
      alert('Error submitting suggestion: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg">
        <h1 className="text-4xl font-bold mb-4">📋 Rules & Scoring Guide</h1>
        <p className="text-blue-100 text-lg">
          Complete guide to Premier League Predictions 2025/26 season
        </p>
        <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-4">
          <p className="text-sm text-blue-100">
            🔒 <strong>These rules are locked for this season</strong> - but you can suggest changes for next season below!
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* League Predictions Rules */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-green-500 text-white p-4">
            <h2 className="text-2xl font-bold">🏆 League Predictions (Main Event)</h2>
            <p className="text-green-100 mt-1">Heavy scoring - this is where you win or lose!</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What You Predict:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span><strong>Top 8 teams</strong> in exact finishing order</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span><strong>Bottom 3 teams</strong> to be relegated (positions 18-20)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span><strong>Your favorite team</strong> (optional - affects ALL your scores!)</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Base Scoring:</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>🎯 Perfect position:</span>
                  <span className="font-bold text-green-600">{LEAGUE_PREDICTION_POINTS.EXACT_POSITION} pts</span>
                </div>
                <div className="flex justify-between">
                  <span>📏 1 position off:</span>
                  <span className="font-bold text-blue-600">{LEAGUE_PREDICTION_POINTS.OFF_BY_ONE} pts</span>
                </div>
                <div className="flex justify-between">
                  <span>📐 2 positions off:</span>
                  <span className="font-bold text-yellow-600">{LEAGUE_PREDICTION_POINTS.OFF_BY_TWO} pts</span>
                </div>
                <div className="flex justify-between">
                  <span>📊 3 positions off:</span>
                  <span className="font-bold text-orange-600">{LEAGUE_PREDICTION_POINTS.OFF_BY_THREE} pts</span>
                </div>
                <div className="flex justify-between">
                  <span>🎪 Right section only:</span>
                  <span className="font-bold text-gray-600">{LEAGUE_PREDICTION_POINTS.CORRECT_SECTION} pts</span>
                </div>
                <div className="flex justify-between">
                  <span>❌ Completely wrong:</span>
                  <span className="font-bold text-red-600">{LEAGUE_PREDICTION_POINTS.COMPLETELY_WRONG} pts</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🚀 Odds-Based Multipliers:</h3>
              <div className="bg-purple-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>🌟 Astronomical (&lt;0.5%):</span>
                  <span className="font-bold text-purple-700">10x multiplier!</span>
                </div>
                <div className="flex justify-between">
                  <span>⚡ Huge surprise (&lt;2%):</span>
                  <span className="font-bold text-purple-600">5x multiplier!</span>
                </div>
                <div className="flex justify-between">
                  <span>💫 Big surprise (&lt;10%):</span>
                  <span className="font-bold text-purple-500">3x multiplier</span>
                </div>
                <div className="flex justify-between">
                  <span>✨ Mild surprise (&lt;25%):</span>
                  <span className="font-bold text-purple-400">1.8x multiplier</span>
                </div>
                <div className="flex justify-between">
                  <span>📈 Expected (25%+):</span>
                  <span className="font-bold text-gray-600">1x multiplier</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                * Multipliers based on live betting odds probability at prediction time
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🏅 Perfect Section Bonuses:</h3>
              <div className="bg-yellow-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>🥇 Perfect Top 4 (exact order):</span>
                  <span className="font-bold text-yellow-800">{LEAGUE_PREDICTION_POINTS.PERFECT_TOP_4} pts</span>
                </div>
                <div className="flex justify-between">
                  <span>🔥 Perfect Top 8 (exact order):</span>
                  <span className="font-bold text-yellow-800">{LEAGUE_PREDICTION_POINTS.PERFECT_TOP_8} pts</span>
                </div>
                <div className="flex justify-between">
                  <span>💀 Perfect Relegation (exact order):</span>
                  <span className="font-bold text-yellow-800">{LEAGUE_PREDICTION_POINTS.PERFECT_RELEGATION} pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Favorite Team & Weekly Challenges */}
        <div className="space-y-8">
          
          {/* Favorite Team Rules */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-yellow-500 text-white p-4">
              <h2 className="text-2xl font-bold">❤️ Favorite Team Multipliers</h2>
              <p className="text-yellow-100 mt-1">High risk, high reward!</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">⚠️ How It Works:</h3>
                <p className="text-sm text-yellow-700">
                  Your favorite team's actual performance vs where you predicted them affects 
                  <strong> ALL your points</strong> with a multiplier. Choose wisely!
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-green-50 rounded">
                  <span>🚀 Great Success (+5 pos):</span>
                  <span className="font-bold text-green-700">{LEAGUE_PREDICTION_POINTS.FAVORITE_TEAM_MULTIPLIERS.GREAT_SUCCESS}x points</span>
                </div>
                <div className="flex justify-between p-2 bg-blue-50 rounded">
                  <span>✨ Success (+2-4 pos):</span>
                  <span className="font-bold text-blue-700">{LEAGUE_PREDICTION_POINTS.FAVORITE_TEAM_MULTIPLIERS.SUCCESS}x points</span>
                </div>
                <div className="flex justify-between p-2 bg-indigo-50 rounded">
                  <span>👍 Mild Success (+1 pos):</span>
                  <span className="font-bold text-indigo-700">{LEAGUE_PREDICTION_POINTS.FAVORITE_TEAM_MULTIPLIERS.MILD_SUCCESS}x points</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>😐 Neutral (exact):</span>
                  <span className="font-bold text-gray-700">{LEAGUE_PREDICTION_POINTS.FAVORITE_TEAM_MULTIPLIERS.NEUTRAL}x points</span>
                </div>
                <div className="flex justify-between p-2 bg-orange-50 rounded">
                  <span>😔 Mild Disappointment (-1 pos):</span>
                  <span className="font-bold text-orange-700">{LEAGUE_PREDICTION_POINTS.FAVORITE_TEAM_MULTIPLIERS.MILD_DISAPPOINTMENT}x points</span>
                </div>
                <div className="flex justify-between p-2 bg-red-50 rounded">
                  <span>😞 Disappointment (-2-4 pos):</span>
                  <span className="font-bold text-red-700">{LEAGUE_PREDICTION_POINTS.FAVORITE_TEAM_MULTIPLIERS.DISAPPOINTMENT}x points</span>
                </div>
                <div className="flex justify-between p-2 bg-red-100 rounded">
                  <span>💀 Disaster (-5+ pos):</span>
                  <span className="font-bold text-red-800">{LEAGUE_PREDICTION_POINTS.FAVORITE_TEAM_MULTIPLIERS.DISASTER}x points</span>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Challenges Rules */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-purple-500 text-white p-4">
              <h2 className="text-2xl font-bold">🎯 Weekly Challenges</h2>
              <p className="text-purple-100 mt-1">Fun mini-games every week</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Challenge Types:</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>📊 Match possession percentages</li>
                  <li>⚽ Total goals in specific games</li>
                  <li>⏱️ First goal timing predictions</li>
                  <li>🟨 Cards and disciplinary predictions</li>
                  <li>🎲 Special event predictions</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Scoring (Closest Wins):</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-green-50 rounded">
                    <span>🎯 Perfect prediction:</span>
                    <span className="font-bold text-green-700">{WEEKLY_CHALLENGE_POINTS.PERFECT_PREDICTION} pts</span>
                  </div>
                  <div className="flex justify-between p-2 bg-blue-50 rounded">
                    <span>🎪 Very close:</span>
                    <span className="font-bold text-blue-700">{WEEKLY_CHALLENGE_POINTS.VERY_CLOSE} pts</span>
                  </div>
                  <div className="flex justify-between p-2 bg-indigo-50 rounded">
                    <span>👌 Close:</span>
                    <span className="font-bold text-indigo-700">{WEEKLY_CHALLENGE_POINTS.CLOSE} pts</span>
                  </div>
                  <div className="flex justify-between p-2 bg-yellow-50 rounded">
                    <span>🤔 Decent:</span>
                    <span className="font-bold text-yellow-700">{WEEKLY_CHALLENGE_POINTS.DECENT} pts</span>
                  </div>
                  <div className="flex justify-between p-2 bg-red-50 rounded">
                    <span>❌ Way off:</span>
                    <span className="font-bold text-red-700">{WEEKLY_CHALLENGE_POINTS.TERRIBLE} pts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Important Rules Section */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-red-500 text-white p-4">
          <h2 className="text-2xl font-bold">⚠️ Important Rules & Deadlines</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-red-800 mb-3 flex items-center">
                🔒 Prediction Deadlines
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <strong>League predictions:</strong> August 31st, 2025 (Transfer Deadline Day)</li>
                <li>• <strong>Weekly challenges:</strong> Before each gameweek starts</li>
                <li>• <strong>No changes</strong> allowed after deadlines</li>
                <li>• <strong>Late submissions:</strong> Not accepted</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                🏆 Leaderboards
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <strong>Overall leaderboard:</strong> Season totals</li>
                <li>• <strong>Monthly leaderboards:</strong> Reset each month</li>
                <li>• <strong>Weekly challenge:</strong> Separate standings</li>
                <li>• <strong>Updates:</strong> After each gameweek</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">🎮 Fair Play Rules:</h3>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• One account per person only</li>
              <li>• No sharing predictions or coordinating answers</li>
              <li>• Respect other participants in discussions</li>
              <li>• Admin decisions on disputes are final</li>
              <li>• Have fun and enjoy the banter!</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Rule Suggestions for Next Season */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-orange-500 text-white p-4">
          <h2 className="text-2xl font-bold">💡 Suggest Rules for Next Season</h2>
          <p className="text-orange-100 mt-1">Help make the game even better for 2026/27!</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-orange-800 mb-2">🔧 Current Season Rules Are Locked</h3>
            <p className="text-sm text-orange-700">
              We can't change scoring or rules mid-season for fairness. But your suggestions will be 
              considered for next season! Popular suggestions will be voted on by all participants.
            </p>
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-900 mb-3">
              Your Rule Suggestion:
            </label>
            <textarea
              value={ruleSuggestion}
              onChange={(e) => setRuleSuggestion(e.target.value)}
              placeholder="e.g., 'Add bonus points for predicting the exact top goalscorer' or 'Create mini-leagues within the main competition' or 'Add predictions for Player of the Season'..."
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={submitRuleSuggestion}
            disabled={!ruleSuggestion.trim() || submitting}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : '💡 Submit Suggestion'}
          </button>

          {/* Recent Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Recent Suggestions:</h3>
              <div className="space-y-3">
                {suggestions.slice(0, 3).map((suggestion) => (
                  <div key={suggestion.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900">{suggestion.user}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(suggestion.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{suggestion.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">💡 Pro Tips for Maximum Points</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">🎯 Strategic Predictions:</h3>
            <ul className="space-y-1 text-sm text-green-100">
              <li>• Bold predictions can pay off massively with odds multipliers</li>
              <li>• Choose your favorite team carefully - it affects everything!</li>
              <li>• Perfect sections give huge bonus points</li>
              <li>• Even being close still scores decent points</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">⏰ Weekly Success:</h3>
            <ul className="space-y-1 text-sm text-green-100">
              <li>• Submit weekly challenges early to avoid missing deadlines</li>
              <li>• Research team news and form for better predictions</li>
              <li>• Consistency in weekly challenges adds up</li>
              <li>• Don't overthink - sometimes gut feelings work!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RulesAndGuide;