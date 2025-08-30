import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { calculateWeeklyChallengeScore, WEEKLY_CHALLENGE_POINTS } from '../utils/scoringSystem';

function WeeklyChallenge({ currentUser }) {
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [userResponse, setUserResponse] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  // Mock weekly challenges data
  const mockChallenges = [
    {
      id: 1,
      week: '2025-W35',
      title: 'Manchester City vs Arsenal Possession Battle',
      description: 'Predict the possession percentage for both teams in this weekend\'s big match!',
      type: 'possession',
      gameDetails: {
        homeTeam: 'Manchester City',
        awayTeam: 'Arsenal',
        date: '2025-08-31',
        venue: 'Etihad Stadium'
      },
      questions: [
        {
          id: 'home_possession',
          label: 'Man City Possession %',
          type: 'slider',
          min: 30,
          max: 80,
          step: 1,
          default: 55
        },
        {
          id: 'away_possession',
          label: 'Arsenal Possession %',
          type: 'slider',
          min: 20,
          max: 70,
          step: 1,
          default: 45
        }
      ],
      deadline: '2025-08-31T15:00:00',
      points: 50,
      icon: '⚽'
    },
    {
      id: 2,
      week: '2025-W36',
      title: 'Liverpool vs Chelsea Goal Fest',
      description: 'How many goals will we see in this Anfield thriller?',
      type: 'goals',
      gameDetails: {
        homeTeam: 'Liverpool',
        awayTeam: 'Chelsea',
        date: '2025-09-07',
        venue: 'Anfield'
      },
      questions: [
        {
          id: 'total_goals',
          label: 'Total Goals in Match',
          type: 'number',
          min: 0,
          max: 8,
          step: 1,
          default: 3
        },
        {
          id: 'first_goal_time',
          label: 'First Goal Minute',
          type: 'slider',
          min: 1,
          max: 90,
          step: 1,
          default: 25
        },
        {
          id: 'cards',
          label: 'Total Yellow Cards',
          type: 'number',
          min: 0,
          max: 10,
          step: 1,
          default: 4
        }
      ],
      deadline: '2025-09-07T16:30:00',
      points: 75,
      icon: '🔥'
    }
  ];

  useEffect(() => {
    fetchCurrentChallenge();
  }, []);

  const fetchCurrentChallenge = async () => {
    try {
      // This would be an actual API call
      // const response = await axios.get('http://localhost:5001/api/challenges/current');
      
      // For now, use mock data - get the first available challenge
      const challenge = mockChallenges[0];
      setCurrentChallenge(challenge);
      
      // Initialize user response with defaults
      const initialResponse = {};
      challenge.questions.forEach(q => {
        initialResponse[q.id] = q.default;
      });
      setUserResponse(initialResponse);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching challenge:', error);
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId, value) => {
    setUserResponse(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Auto-adjust possession percentages to add up to 100%
    if (currentChallenge.type === 'possession') {
      if (questionId === 'home_possession') {
        setUserResponse(prev => ({
          ...prev,
          [questionId]: value,
          away_possession: 100 - value
        }));
      } else if (questionId === 'away_possession') {
        setUserResponse(prev => ({
          ...prev,
          [questionId]: value,
          home_possession: 100 - value
        }));
      }
    }
  };

  const submitResponse = async () => {
    try {
      // This would be an actual API call
      // await axios.post('http://localhost:5001/api/challenges/submit', {
      //   challengeId: currentChallenge.id,
      //   responses: userResponse
      // });
      
      setSubmitted(true);
      alert(`Challenge submitted! You'll earn points based on accuracy when results are available.\n\n🎯 Perfect: ${WEEKLY_CHALLENGE_POINTS.PERFECT_PREDICTION} pts\n✨ Very Close: ${WEEKLY_CHALLENGE_POINTS.VERY_CLOSE} pts\n👍 Close: ${WEEKLY_CHALLENGE_POINTS.CLOSE} pts`);
    } catch (error) {
      alert('Error submitting challenge: ' + error.message);
    }
  };

  const formatTimeLeft = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  if (loading) return <div className="text-center py-8">Loading weekly challenge...</div>;

  if (!currentChallenge) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Challenges</h2>
        <p className="text-gray-600">Check back soon for new weekly challenges!</p>
      </div>
    );
  }

  const timeLeft = formatTimeLeft(currentChallenge.deadline);
  const isExpired = timeLeft === 'Expired';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {currentChallenge.icon} Weekly Challenge
            </h1>
            <p className="text-purple-100">Week {currentChallenge.week.split('-W')[1]} Challenge</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{currentChallenge.points}</div>
            <div className="text-sm text-purple-100">Points</div>
          </div>
        </div>
      </div>

      {/* Challenge Content */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Game Info */}
        <div className="bg-gray-50 p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">{currentChallenge.title}</h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isExpired ? 'bg-red-100 text-red-800' : 
              submitted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isExpired ? '⏰ Expired' : submitted ? '✅ Submitted' : `⏱️ ${timeLeft}`}
            </div>
          </div>
          
          <p className="text-gray-600 mb-4">{currentChallenge.description}</p>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-center space-x-8 text-lg font-semibold">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mb-2">
                  {currentChallenge.gameDetails.homeTeam.split(' ').map(w => w[0]).join('')}
                </div>
                <div>{currentChallenge.gameDetails.homeTeam}</div>
              </div>
              <div className="text-2xl text-gray-400">VS</div>
              <div className="text-center">
                <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center mb-2">
                  {currentChallenge.gameDetails.awayTeam.split(' ').map(w => w[0]).join('')}
                </div>
                <div>{currentChallenge.gameDetails.awayTeam}</div>
              </div>
            </div>
            <div className="text-center text-sm text-gray-600 mt-4">
              {new Date(currentChallenge.gameDetails.date).toLocaleDateString()} • {currentChallenge.gameDetails.venue}
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="p-6">
          <div className="space-y-6">
            {currentChallenge.questions.map((question) => (
              <div key={question.id} className="space-y-3">
                <label className="block text-lg font-medium text-gray-900">
                  {question.label}
                </label>
                
                {question.type === 'slider' && (
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={question.min}
                      max={question.max}
                      step={question.step}
                      value={userResponse[question.id] || question.default}
                      onChange={(e) => handleResponseChange(question.id, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      disabled={isExpired || submitted}
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{question.min}%</span>
                      <span className="font-bold text-lg text-primary-600">
                        {userResponse[question.id] || question.default}%
                      </span>
                      <span>{question.max}%</span>
                    </div>
                  </div>
                )}
                
                {question.type === 'number' && (
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleResponseChange(question.id, Math.max(question.min, (userResponse[question.id] || question.default) - 1))}
                      className="w-10 h-10 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 font-bold"
                      disabled={isExpired || submitted}
                    >
                      -
                    </button>
                    <div className="text-2xl font-bold text-primary-600 w-16 text-center">
                      {userResponse[question.id] || question.default}
                    </div>
                    <button
                      onClick={() => handleResponseChange(question.id, Math.min(question.max, (userResponse[question.id] || question.default) + 1))}
                      className="w-10 h-10 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 font-bold"
                      disabled={isExpired || submitted}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            {!submitted && !isExpired ? (
              <button
                onClick={submitResponse}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-8 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>🎯</span>
                <span>Submit Challenge ({currentChallenge.points} points)</span>
              </button>
            ) : (
              <div className="text-center py-4">
                {submitted ? (
                  <div className="text-green-600 font-semibold">
                    ✅ Challenge Submitted! Check back after the game for results.
                  </div>
                ) : (
                  <div className="text-red-600 font-semibold">
                    ⏰ This challenge has expired.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Challenges Preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">🔮 Coming Up</h3>
        <div className="space-y-3">
          {mockChallenges.slice(1, 3).map((challenge) => (
            <div key={challenge.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{challenge.icon}</div>
                <div>
                  <div className="font-medium">{challenge.title}</div>
                  <div className="text-sm text-gray-600">{challenge.gameDetails.homeTeam} vs {challenge.gameDetails.awayTeam}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{challenge.points} pts</div>
                <div className="text-xs text-gray-500">Week {challenge.week.split('-W')[1]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WeeklyChallenge;