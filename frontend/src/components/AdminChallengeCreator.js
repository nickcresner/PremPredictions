import React, { useState, useEffect } from 'react';
import { fixtureService, CHALLENGE_TEMPLATES } from '../services/fixtureService';

function AdminChallengeCreator({ currentUser, onChallengeCreated }) {
  const [upcomingFixtures, setUpcomingFixtures] = useState([]);
  const [selectedFixture, setSelectedFixture] = useState(null);
  const [challengeOptions, setChallengeOptions] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customSettings, setCustomSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    fetchUpcomingFixtures();
  }, []);

  useEffect(() => {
    if (selectedFixture) {
      const options = fixtureService.generateChallengeOptions(selectedFixture);
      setChallengeOptions(options);
    }
  }, [selectedFixture]);

  const fetchUpcomingFixtures = async () => {
    try {
      const fixtures = await fixtureService.getUpcomingFixtures(15);
      setUpcomingFixtures(fixtures);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching fixtures:', error);
      setLoading(false);
    }
  };

  const createChallenge = async () => {
    if (!selectedFixture || !selectedTemplate) {
      alert('Please select both a fixture and challenge template');
      return;
    }

    try {
      const challengeData = {
        ...selectedTemplate,
        fixture: selectedFixture,
        customSettings,
        createdBy: currentUser,
        createdAt: new Date().toISOString(),
        active: true
      };

      // In production, this would be an API call
      console.log('Creating challenge:', challengeData);
      alert('Weekly challenge created successfully! 🎯');
      
      if (onChallengeCreated) {
        onChallengeCreated(challengeData);
      }

      // Reset form
      setSelectedFixture(null);
      setSelectedTemplate(null);
      setCustomSettings({});
      
    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('Error creating challenge: ' + error.message);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || colors.medium;
  };

  const getInteractionIcon = (type) => {
    const icons = {
      sliders: '🎚️',
      mixed: '🎮',
      taps: '👆',
      quick_tap: '⚡',
      drag_drop: '👋',
      rapid_fire: '🔥'
    };
    return icons[type] || '🎯';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚽</div>
          <div className="text-lg font-semibold text-gray-700">Loading fixtures...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-xl">
        <h2 className="text-3xl font-bold mb-2">🎯 Create Weekly Challenge</h2>
        <p className="text-purple-100">Choose fixtures and challenge types for this week's mini-game</p>
      </div>

      {/* Step 1: Select Fixture */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-500 text-white p-4">
          <h3 className="text-xl font-bold">Step 1: Select Fixture</h3>
          <p className="text-blue-100 text-sm">Choose which match to base the challenge on</p>
        </div>
        
        <div className="p-6">
          <div className="grid gap-4">
            {upcomingFixtures.map((fixture) => (
              <div
                key={fixture.id}
                onClick={() => setSelectedFixture(fixture)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedFixture?.id === fixture.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {fixture.homeTeam.split(' ').map(w => w[0]).join('')}
                      </div>
                      <div className="text-xs mt-1">{fixture.homeTeam}</div>
                    </div>
                    
                    <div className="text-xl font-bold text-gray-400">VS</div>
                    
                    <div className="text-center">
                      <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {fixture.awayTeam.split(' ').map(w => w[0]).join('')}
                      </div>
                      <div className="text-xs mt-1">{fixture.awayTeam}</div>
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-gray-600">
                    <div className="font-semibold">{new Date(fixture.date).toLocaleDateString()}</div>
                    <div>{fixture.kickoff} • {fixture.venue}</div>
                  </div>
                </div>
                
                {/* Additional fixture details */}
                {fixture.weather && (
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded p-2">
                    <span>Weather: {fixture.weather.condition}, {fixture.weather.temperature}°C</span>
                    <span>Referee: {fixture.referee}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step 2: Choose Challenge Type */}
      {selectedFixture && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-green-500 text-white p-4">
            <h3 className="text-xl font-bold">Step 2: Choose Challenge Type</h3>
            <p className="text-green-100 text-sm">Pick the type of interactive challenge</p>
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {challengeOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => setSelectedTemplate(option)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-102 ${
                    selectedTemplate?.id === option.id
                      ? 'border-green-500 bg-green-50 shadow-md scale-102'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center space-y-3">
                    <div className="text-4xl">{option.icon}</div>
                    <h4 className="font-bold text-lg">{option.name}</h4>
                    <p className="text-sm text-gray-600">{option.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`px-2 py-1 rounded-full font-medium ${getDifficultyColor(option.difficulty)}`}>
                          {option.difficulty.toUpperCase()}
                        </span>
                        <span className="text-gray-500">{option.timeToComplete}</span>
                      </div>
                      
                      <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                        <span>{getInteractionIcon(option.interactionType)}</span>
                        <span>{option.interactionType.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Customize Settings */}
      {selectedTemplate && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-orange-500 text-white p-4">
            <h3 className="text-xl font-bold">Step 3: Customize Challenge</h3>
            <p className="text-orange-100 text-sm">Fine-tune the challenge settings</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Points Settings */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">Points Reward</label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min={25}
                  max={200}
                  step={25}
                  value={customSettings.points || 75}
                  onChange={(e) => setCustomSettings({...customSettings, points: parseInt(e.target.value)})}
                  className="flex-1"
                />
                <span className="text-2xl font-bold text-primary-600">{customSettings.points || 75} pts</span>
              </div>
            </div>

            {/* Time Limit */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">Time Limit</label>
              <div className="grid grid-cols-4 gap-2">
                {[30, 60, 120, 180].map(seconds => (
                  <button
                    key={seconds}
                    onClick={() => setCustomSettings({...customSettings, timeLimit: seconds})}
                    className={`p-3 rounded-lg font-semibold transition-colors ${
                      (customSettings.timeLimit || 120) === seconds
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {seconds < 60 ? `${seconds}s` : `${seconds/60}m`}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Features */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">Special Features</label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={customSettings.confetti || true}
                    onChange={(e) => setCustomSettings({...customSettings, confetti: e.target.checked})}
                    className="w-5 h-5 text-primary-600"
                  />
                  <span className="flex items-center space-x-2">
                    <span>🎉</span>
                    <span>Confetti on submit</span>
                  </span>
                </label>
                
                <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={customSettings.haptics || true}
                    onChange={(e) => setCustomSettings({...customSettings, haptics: e.target.checked})}
                    className="w-5 h-5 text-primary-600"
                  />
                  <span className="flex items-center space-x-2">
                    <span>📳</span>
                    <span>Haptic feedback</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Challenge Preview</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div><strong>Match:</strong> {selectedFixture.homeTeam} vs {selectedFixture.awayTeam}</div>
                <div><strong>Type:</strong> {selectedTemplate.name}</div>
                <div><strong>Questions:</strong> {selectedTemplate.questions.length}</div>
                <div><strong>Time Limit:</strong> {Math.floor((customSettings.timeLimit || 120) / 60)}:{String((customSettings.timeLimit || 120) % 60).padStart(2, '0')}</div>
                <div><strong>Points:</strong> {customSettings.points || 75} pts</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Challenge Button */}
      {selectedFixture && selectedTemplate && (
        <div className="flex justify-center">
          <button
            onClick={createChallenge}
            className="px-12 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white text-xl font-bold rounded-xl shadow-xl hover:from-green-600 hover:to-blue-600 transition-all duration-200 hover:scale-105"
          >
            🎯 Create This Week's Challenge!
          </button>
        </div>
      )}

      {/* Challenge Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Challenge Templates Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{Object.keys(CHALLENGE_TEMPLATES).length}</div>
            <div className="text-sm text-green-700">Total Templates</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {Object.values(CHALLENGE_TEMPLATES).filter(t => t.difficulty === 'easy').length}
            </div>
            <div className="text-sm text-blue-700">Easy Challenges</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {Object.values(CHALLENGE_TEMPLATES).filter(t => t.difficulty === 'medium').length}
            </div>
            <div className="text-sm text-yellow-700">Medium Challenges</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {Object.values(CHALLENGE_TEMPLATES).filter(t => t.difficulty === 'hard').length}
            </div>
            <div className="text-sm text-red-700">Hard Challenges</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminChallengeCreator;