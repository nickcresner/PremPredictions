import React, { useState, useEffect } from 'react';
import { oddsService } from '../services/oddsService';

function OddsDisplay({ team = null, position = null, showSummary = false }) {
  const [odds, setOdds] = useState(null);
  const [oddsSummary, setOddsSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchOddsData();
    // Refresh odds every 5 minutes
    const interval = setInterval(fetchOddsData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [team, position, showSummary]);

  const fetchOddsData = async () => {
    try {
      if (showSummary) {
        const summary = await oddsService.getOddsSummary();
        setOddsSummary(summary);
      } else if (team && position) {
        const leagueOdds = await oddsService.fetchLeagueOdds();
        const teamOdds = leagueOdds[team];
        if (teamOdds) {
          setOdds({
            team,
            position,
            odds: teamOdds.toFinish[position]?.odds || null,
            probability: teamOdds.toFinish[position]?.probability || null
          });
        }
      }
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching odds:', error);
      setLoading(false);
    }
  };

  const formatOdds = (odds) => {
    if (!odds) return 'N/A';
    if (odds >= 100) return `${Math.round(odds)}/1`;
    return `${odds}/1`;
  };

  const getProbabilityColor = (probability) => {
    if (probability > 50) return 'text-green-600 bg-green-50';
    if (probability > 25) return 'text-yellow-600 bg-yellow-50';  
    if (probability > 10) return 'text-orange-600 bg-orange-50';
    if (probability > 2) return 'text-red-600 bg-red-50';
    return 'text-purple-600 bg-purple-50';
  };

  const getSurpriseIcon = (probability) => {
    if (probability < 2) return '🚀';
    if (probability < 10) return '⭐';
    if (probability < 25) return '💫';
    return '📊';
  };

  if (loading) {
    return (
      <div className="text-xs text-gray-500 flex items-center space-x-1">
        <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading odds...</span>
      </div>
    );
  }

  if (showSummary && oddsSummary) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">📊 Live Betting Odds</h3>
          <div className="text-xs text-gray-500">
            Updated: {lastUpdated?.toLocaleTimeString()}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Title Favorites */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              🏆 Title Favorites
            </h4>
            <div className="space-y-2">
              {oddsSummary.favorites.map((item, index) => (
                <div key={item.team} className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm font-medium">{item.team}</span>
                  <div className="text-right">
                    <div className="text-xs font-bold text-green-600">
                      {item.probability.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatOdds(item.odds)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Long Shots */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              🚀 Long Shots (Top 4)
            </h4>
            <div className="space-y-2">
              {oddsSummary.longshots.map((item, index) => (
                <div key={item.team} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                  <span className="text-sm font-medium">{item.team}</span>
                  <div className="text-right">
                    <div className="text-xs font-bold text-purple-600">
                      {item.probability.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatOdds(item.odds)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Relegation Favorites */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              📉 Relegation Risk
            </h4>
            <div className="space-y-2">
              {oddsSummary.relegationFavorites.map((item, index) => (
                <div key={item.team} className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="text-sm font-medium">{item.team}</span>
                  <div className="text-right">
                    <div className="text-xs font-bold text-red-600">
                      {item.probability.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatOdds(item.odds)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">💡 How This Affects Scoring</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div>• <strong>Low probability predictions</strong> get huge point multipliers</div>
            <div>• <strong>&lt;2% chance:</strong> 5x multiplier 🚀</div>
            <div>• <strong>&lt;10% chance:</strong> 3x multiplier ⭐</div>
            <div>• <strong>&lt;25% chance:</strong> 1.8x multiplier 💫</div>
          </div>
        </div>
      </div>
    );
  }

  if (odds) {
    return (
      <div className="flex items-center space-x-2">
        <div className={`px-2 py-1 rounded text-xs font-medium ${getProbabilityColor(odds.probability)}`}>
          <div className="flex items-center space-x-1">
            <span>{getSurpriseIcon(odds.probability)}</span>
            <span>{odds.probability.toFixed(1)}%</span>
          </div>
        </div>
        <div className="text-xs text-gray-600">
          odds: {formatOdds(odds.odds)}
        </div>
      </div>
    );
  }

  return null;
}

export default OddsDisplay;