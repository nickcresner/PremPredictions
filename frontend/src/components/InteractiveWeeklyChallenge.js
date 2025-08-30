import React, { useState, useEffect, useRef } from 'react';
import { fixtureService } from '../services/fixtureService';
import { calculateWeeklyChallengeScore, WEEKLY_CHALLENGE_POINTS } from '../utils/scoringSystem';

// Confetti animation component
function Confetti({ active }) {
  if (!active) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-bounce"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-10px`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
            fontSize: `${1 + Math.random()}rem`
          }}
        >
          {['🎉', '✨', '🎊', '⚽', '🏆', '🎯'][Math.floor(Math.random() * 6)]}
        </div>
      ))}
    </div>
  );
}

// Interactive slider component with haptic feedback
function InteractiveSlider({ question, value, onChange, disabled }) {
  const [isActive, setIsActive] = useState(false);
  
  const handleChange = (e) => {
    const newValue = parseInt(e.target.value);
    onChange(newValue);
    
    // Haptic feedback simulation (works on mobile)
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <span className="text-2xl">{question.icon}</span>
          <span>{question.label}</span>
        </label>
        <div className={`text-3xl font-bold transition-all duration-300 ${
          isActive ? 'scale-125 text-primary-600' : 'text-gray-800'
        }`}>
          {value}{question.label.includes('%') ? '%' : ''}
        </div>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min={question.min}
          max={question.max}
          step={question.step}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsActive(true)}
          onMouseUp={() => setIsActive(false)}
          onTouchStart={() => setIsActive(true)}
          onTouchEnd={() => setIsActive(false)}
          disabled={disabled}
          className={`w-full h-4 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer transition-all duration-200 ${
            isActive ? 'scale-105 shadow-lg' : 'hover:scale-102'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{
            background: `linear-gradient(to right, 
              #3b82f6 0%, 
              #8b5cf6 ${((value - question.min) / (question.max - question.min)) * 100}%, 
              #e2e8f0 ${((value - question.min) / (question.max - question.min)) * 100}%, 
              #e2e8f0 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{question.min}</span>
          <span>{question.max}</span>
        </div>
      </div>
    </div>
  );
}

// Interactive counter with +/- buttons
function InteractiveCounter({ question, value, onChange, disabled }) {
  const [pulseAnimation, setPulseAnimation] = useState('');

  const handleIncrement = () => {
    if (value < question.max) {
      onChange(value + 1);
      setPulseAnimation('animate-pulse');
      setTimeout(() => setPulseAnimation(''), 200);
      if (navigator.vibrate) navigator.vibrate(15);
    }
  };

  const handleDecrement = () => {
    if (value > question.min) {
      onChange(value - 1);
      setPulseAnimation('animate-pulse');
      setTimeout(() => setPulseAnimation(''), 200);
      if (navigator.vibrate) navigator.vibrate(15);
    }
  };

  return (
    <div className="space-y-4">
      <label className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
        <span className="text-2xl">{question.icon}</span>
        <span>{question.label}</span>
      </label>
      
      <div className="flex items-center justify-center space-x-6">
        <button
          onClick={handleDecrement}
          disabled={disabled || value <= question.min}
          className="w-16 h-16 bg-red-500 text-white rounded-full font-bold text-2xl hover:bg-red-600 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
        >
          -
        </button>
        
        <div className={`text-6xl font-bold text-primary-600 min-w-[80px] text-center ${pulseAnimation}`}>
          {value}
        </div>
        
        <button
          onClick={handleIncrement}
          disabled={disabled || value >= question.max}
          className="w-16 h-16 bg-green-500 text-white rounded-full font-bold text-2xl hover:bg-green-600 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
        >
          +
        </button>
      </div>
    </div>
  );
}

// Interactive button selector
function InteractiveButtons({ question, value, onChange, disabled }) {
  return (
    <div className="space-y-4">
      <label className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
        <span className="text-2xl">{question.icon}</span>
        <span>{question.label}</span>
      </label>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {question.options.map((option) => (
          <button
            key={option.value}
            onClick={() => {
              onChange(option.value);
              if (navigator.vibrate) navigator.vibrate(20);
            }}
            disabled={disabled}
            className={`p-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              value === option.value
                ? 'bg-primary-500 text-white shadow-xl scale-105 ring-4 ring-primary-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-md'
            } ${disabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : ''}`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">{option.icon}</span>
              <span>{option.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Spinning wheel component
function SpinningWheel({ question, value, onChange, disabled }) {
  const [spinning, setSpinning] = useState(false);
  const wheelRef = useRef(null);

  const spin = () => {
    if (disabled || spinning) return;
    
    setSpinning(true);
    const randomValue = question.min + Math.floor(Math.random() * (question.max - question.min + 1));
    
    // Visual spinning animation
    if (wheelRef.current) {
      wheelRef.current.style.transform = `rotate(${Math.random() * 1080 + 720}deg)`;
    }
    
    setTimeout(() => {
      onChange(randomValue);
      setSpinning(false);
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <label className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
        <span className="text-2xl">{question.icon}</span>
        <span>{question.label}</span>
      </label>
      
      <div className="flex flex-col items-center space-y-4">
        <div 
          ref={wheelRef}
          className="w-32 h-32 border-8 border-primary-500 rounded-full flex items-center justify-center text-4xl font-bold bg-gradient-to-br from-primary-400 to-purple-600 text-white shadow-2xl transition-transform duration-2000 ease-out"
        >
          {spinning ? '🎲' : value}
        </div>
        
        <button
          onClick={spin}
          disabled={disabled || spinning}
          className={`px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full shadow-lg transition-all duration-200 ${
            spinning 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:scale-105 active:scale-95 hover:shadow-xl'
          }`}
        >
          {spinning ? 'Spinning...' : '🎲 Spin!'}
        </button>
      </div>
    </div>
  );
}

// Progress bar component
function ProgressBar({ current, total, animated = true }) {
  const percentage = (current / total) * 100;
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
      <div 
        className={`h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-500 ${
          animated ? 'animate-pulse' : ''
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function InteractiveWeeklyChallenge({ currentUser }) {
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [userResponse, setUserResponse] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [showResults, setShowResults] = useState(false);
  
  useEffect(() => {
    fetchCurrentChallenge();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (currentChallenge && !submitted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !submitted) {
      handleAutoSubmit();
    }
  }, [timeLeft, currentChallenge, submitted]);

  const fetchCurrentChallenge = async () => {
    try {
      // Get live fixtures and generate challenge
      const fixtures = await fixtureService.getUpcomingFixtures(1);
      if (fixtures.length > 0) {
        const fixture = fixtures[0];
        const challengeOptions = fixtureService.generateChallengeOptions(fixture);
        
        // Randomly select a challenge type for variety
        const selectedChallenge = challengeOptions[Math.floor(Math.random() * challengeOptions.length)];
        
        setCurrentChallenge({
          ...selectedChallenge,
          id: Date.now(),
          week: `2025-W${Math.ceil(Date.now() / (7 * 24 * 60 * 60 * 1000))}`,
          deadline: fixture.date,
          points: 75 + Math.floor(Math.random() * 50) // 75-125 points
        });
        
        // Initialize responses
        const initialResponse = {};
        selectedChallenge.questions.forEach(q => {
          initialResponse[q.id] = q.default;
        });
        setUserResponse(initialResponse);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching challenge:', error);
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId, value) => {
    setUserResponse(prev => ({ ...prev, [questionId]: value }));
    
    // Auto-adjust for possession percentages
    if (currentChallenge.id === 'possession') {
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

  const nextQuestion = () => {
    if (currentQuestion < currentChallenge.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitResponse();
    }
  };

  const submitResponse = async () => {
    try {
      setSubmitted(true);
      setShowConfetti(true);
      
      // Hide confetti after 3 seconds
      setTimeout(() => setShowConfetti(false), 3000);
      
      // Show results after confetti
      setTimeout(() => setShowResults(true), 1000);
      
      // Haptic celebration
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }
      
    } catch (error) {
      console.error('Error submitting challenge:', error);
    }
  };

  const handleAutoSubmit = () => {
    submitResponse();
  };

  const renderQuestion = (question, index) => {
    const value = userResponse[question.id] || question.default;
    const disabled = submitted;

    switch (question.type) {
      case 'slider':
      case 'range_slider':
        return (
          <InteractiveSlider
            question={question}
            value={value}
            onChange={(val) => handleResponseChange(question.id, val)}
            disabled={disabled}
          />
        );
      
      case 'counter':
        return (
          <InteractiveCounter
            question={question}
            value={value}
            onChange={(val) => handleResponseChange(question.id, val)}
            disabled={disabled}
          />
        );
      
      case 'buttons':
      case 'quick_buttons':
        return (
          <InteractiveButtons
            question={question}
            value={value}
            onChange={(val) => handleResponseChange(question.id, val)}
            disabled={disabled}
          />
        );
      
      case 'wheel':
      case 'spinner':
        return (
          <SpinningWheel
            question={question}
            value={value}
            onChange={(val) => handleResponseChange(question.id, val)}
            disabled={disabled}
          />
        );
      
      default:
        return (
          <InteractiveSlider
            question={question}
            value={value}
            onChange={(val) => handleResponseChange(question.id, val)}
            disabled={disabled}
          />
        );
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="animate-spin text-6xl mb-4">⚽</div>
        <div className="text-xl font-semibold text-gray-700">Loading this week's challenge...</div>
      </div>
    </div>
  );

  if (!currentChallenge) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Challenges</h2>
        <p className="text-gray-600">Check back soon for new weekly challenges!</p>
      </div>
    );
  }

  const isExpired = new Date() > new Date(currentChallenge.deadline);
  const progress = ((currentQuestion + 1) / currentChallenge.questions.length) * 100;

  return (
    <div className="space-y-6 relative">
      <Confetti active={showConfetti} />
      
      {/* Header with timer and progress */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <span className="text-4xl">{currentChallenge.icon}</span>
              <span>{currentChallenge.name}</span>
            </h1>
            <p className="text-purple-100 mt-1">{currentChallenge.description}</p>
          </div>
          
          <div className="text-right">
            <div className={`text-3xl font-bold ${timeLeft < 30 ? 'animate-pulse text-red-200' : ''}`}>
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-purple-100">Time Left</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{currentQuestion + 1} of {currentChallenge.questions.length}</span>
          </div>
          <ProgressBar current={currentQuestion + 1} total={currentChallenge.questions.length} />
        </div>
      </div>

      {/* Game Details */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl font-bold">
                  {currentChallenge.fixture.homeTeam.split(' ').map(w => w[0]).join('')}
                </span>
              </div>
              <div className="font-bold">{currentChallenge.fixture.homeTeam}</div>
            </div>
            
            <div className="text-3xl font-bold animate-pulse">VS</div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl font-bold">
                  {currentChallenge.fixture.awayTeam.split(' ').map(w => w[0]).join('')}
                </span>
              </div>
              <div className="font-bold">{currentChallenge.fixture.awayTeam}</div>
            </div>
          </div>
          
          <div className="text-center mt-4 text-sm opacity-90">
            {new Date(currentChallenge.fixture.date).toLocaleDateString()} • {currentChallenge.fixture.venue}
          </div>
        </div>

        {/* Question */}
        <div className="p-8">
          {!submitted ? (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6">
                {renderQuestion(currentChallenge.questions[currentQuestion], currentQuestion)}
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
                >
                  ← Previous
                </button>
                
                <button
                  onClick={nextQuestion}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-bold hover:from-green-600 hover:to-blue-600 transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  {currentQuestion === currentChallenge.questions.length - 1 ? 'Submit! 🎯' : 'Next →'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-8xl animate-bounce mb-6">🎉</div>
              <h2 className="text-3xl font-bold text-green-600 mb-4">Challenge Complete!</h2>
              <p className="text-xl text-gray-600 mb-6">
                Great job! You've earned up to <strong>{currentChallenge.points} points</strong>
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-green-800 text-sm">
                  Your score will be calculated based on accuracy when the match results are available.
                  Check back after the game to see how you did!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Points Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">💰 Points Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="font-bold text-green-600">{WEEKLY_CHALLENGE_POINTS.PERFECT_PREDICTION}</div>
            <div className="text-xs text-green-700">Perfect</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="font-bold text-blue-600">{WEEKLY_CHALLENGE_POINTS.VERY_CLOSE}</div>
            <div className="text-xs text-blue-700">Very Close</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="font-bold text-yellow-600">{WEEKLY_CHALLENGE_POINTS.CLOSE}</div>
            <div className="text-xs text-yellow-700">Close</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="font-bold text-gray-600">{WEEKLY_CHALLENGE_POINTS.DECENT}</div>
            <div className="text-xs text-gray-700">Decent</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InteractiveWeeklyChallenge;