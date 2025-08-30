import React, { useState, useEffect } from 'react';

function WeeklySummary({ currentWeek }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock participant data - would come from API
  const participants = [
    {
      name: 'Nick',
      avatar: '/api/photos/nick.jpg',
      personality: 'optimistic_risk_taker',
      recentPerformance: 'hot_streak',
      favoriteTeam: 'Arsenal',
      points: 1150,
      weeklyPoints: 85,
      accuracy: 73
    },
    {
      name: 'Alice', 
      avatar: '/api/photos/alice.jpg',
      personality: 'analytical_safe',
      recentPerformance: 'consistent',
      favoriteTeam: 'Man City',
      points: 1250,
      weeklyPoints: 45,
      accuracy: 81
    },
    {
      name: 'Bob',
      avatar: '/api/photos/bob.jpg', 
      personality: 'chaotic_wildcard',
      recentPerformance: 'slumping',
      favoriteTeam: 'Liverpool',
      points: 1180,
      weeklyPoints: 25,
      accuracy: 62
    },
    {
      name: 'Charlie',
      avatar: '/api/photos/charlie.jpg',
      personality: 'data_driven',
      recentPerformance: 'steady',
      favoriteTeam: 'Chelsea',
      points: 1100,
      weeklyPoints: 70,
      accuracy: 79
    },
    {
      name: 'Diana',
      avatar: '/api/photos/diana.jpg',
      personality: 'underdog_lover',
      recentPerformance: 'rising',
      favoriteTeam: 'Brighton',
      points: 1050,
      weeklyPoints: 95,
      accuracy: 68
    }
  ];

  useEffect(() => {
    generateWeeklySummary();
  }, [currentWeek]);

  const generateWeeklySummary = () => {
    // Simulate API call delay
    setTimeout(() => {
      const weekSummary = createEngagingSummary(participants, currentWeek);
      setSummary(weekSummary);
      setLoading(false);
    }, 1000);
  };

  const createEngagingSummary = (participants, week) => {
    // Sort by weekly performance
    const sortedByWeek = [...participants].sort((a, b) => b.weeklyPoints - a.weeklyPoints);
    const winner = sortedByWeek[0];
    const loser = sortedByWeek[sortedByWeek.length - 1];
    
    // Find interesting narratives
    const bigMover = participants.find(p => p.recentPerformance === 'rising');
    const hotStreak = participants.find(p => p.recentPerformance === 'hot_streak');
    const wildcard = participants.find(p => p.personality === 'chaotic_wildcard');

    const summaryData = {
      title: getWeeklyTitle(week),
      highlights: [
        `🏆 ${winner.name} absolutely dominated this week with ${winner.weeklyPoints} points!`,
        `💔 ${loser.name} had a shocker, managing only ${loser.weeklyPoints} points`,
        bigMover ? `📈 ${bigMover.name} is on the rise - watch out leaders!` : null,
        hotStreak ? `🔥 ${hotStreak.name} can't stop won't stop - ${hotStreak.accuracy}% accuracy!` : null,
        wildcard ? `🎲 ${wildcard.name} being ${wildcard.name} - chaos incarnate as usual` : null
      ].filter(Boolean),
      
      weeklyWinner: winner,
      performances: sortedByWeek.map((p, index) => ({
        ...p,
        weeklyRank: index + 1,
        commentary: generatePersonalizedCommentary(p, index, sortedByWeek.length)
      })),
      
      funFacts: generateFunFacts(participants),
      predictions: generateNextWeekPredictions(participants)
    };

    return summaryData;
  };

  const getWeeklyTitle = (week) => {
    const titles = [
      "The Weekly Warfare Report 📊",
      "Predictions Pandemonium Update 🎪", 
      "The Beautiful Game's Chaos Chronicles 🌪️",
      "Another Week, Another Prediction Meltdown 💥",
      "The Weekly 'Who Knows Football?' Report 🤷‍♂️",
      "Prediction Pros vs Prediction Potatoes 🥔",
      "The Weekly Reality Check ✅",
      "Football Wisdom vs Pure Guesswork 🎯"
    ];
    return titles[week % titles.length];
  };

  const generatePersonalizedCommentary = (participant, rank, total) => {
    const { name, personality, recentPerformance, favoriteTeam, weeklyPoints, accuracy } = participant;
    
    const personalityTraits = {
      optimistic_risk_taker: ["takes bold risks", "always betting on underdogs", "never plays it safe"],
      analytical_safe: ["plays it safe", "loves the spreadsheets", "Mr/Ms Reliable"],
      chaotic_wildcard: ["pure chaos energy", "makes no sense", "somehow still competitive"], 
      data_driven: ["lives by the numbers", "has multiple monitors", "probably uses xG unironically"],
      underdog_lover: ["always backs the little guys", "believes in fairy tales", "Leicester 2016 energy"]
    };

    const performanceQuips = {
      hot_streak: "is absolutely on fire 🔥",
      consistent: "steady as she goes ⚓", 
      slumping: "having a mare lately 😴",
      rising: "climbing the ranks fast 📈",
      steady: "reliable as a Swiss watch ⌚"
    };

    const traits = personalityTraits[personality] || ["does their thing"];
    const performance = performanceQuips[recentPerformance] || "exists";
    
    let commentary = `${name} ${performance} with ${weeklyPoints} points. `;
    
    if (rank === 0) {
      commentary += `Absolutely demolished everyone this week! ${traits[0]} and it paid off big time. `;
    } else if (rank === total - 1) {
      commentary += `Ooof, rough week. Even ${favoriteTeam} fans are questioning this performance. `;
    } else if (rank < total / 2) {
      commentary += `Solid showing! ${traits[1]} is clearly working. `;
    } else {
      commentary += `${traits[2]} but maybe needs a new strategy? `;
    }

    // Add accuracy comment
    if (accuracy > 80) {
      commentary += "Scary accurate lately! 🎯";
    } else if (accuracy > 70) {
      commentary += "Pretty reliable predictions 👍";  
    } else if (accuracy > 60) {
      commentary += "Hit and miss but that's football! ⚽";
    } else {
      commentary += "Might want to consult a magic 8-ball 🎱";
    }

    return commentary;
  };

  const generateFunFacts = (participants) => [
    `📊 Average accuracy this week: ${Math.round(participants.reduce((sum, p) => sum + p.accuracy, 0) / participants.length)}%`,
    `🎯 Most accurate predictor: ${participants.reduce((prev, current) => prev.accuracy > current.accuracy ? prev : current).name}`,
    `🎲 Wildest prediction: Someone actually thought ${participants[0].favoriteTeam} would keep a clean sheet`,
    `💰 If we were betting real money, we'd all be broke by now`,
    `🏆 Current leader ${participants.reduce((prev, current) => prev.points > current.points ? prev : current).name} is only ahead because of that lucky Week 3 punt`
  ];

  const generateNextWeekPredictions = (participants) => [
    `${participants[0].name} will probably go for another risky pick and somehow make it work`,
    `${participants[1].name} will play it safe with boring but sensible predictions`, 
    `Someone will definitely predict a 0-0 draw and actually get it right`,
    `The weekly challenge will separate the heroes from the zeros once again`,
    `At least one person will forget to submit and blame 'technical difficulties'`
  ];

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-gray-600">Crafting this week's hilarious summary...</p>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">{summary.title}</h2>
        <p className="text-blue-100">Week {currentWeek} • {new Date().toLocaleDateString()}</p>
      </div>

      {/* Main Highlights */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold mb-4">📢 This Week's Headlines</h3>
        <div className="space-y-2">
          {summary.highlights.map((highlight, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">•</span>
              <p className="text-gray-700">{highlight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Winner Spotlight */}
      <div className="p-6 bg-yellow-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold mb-4">⭐ Weekly Champion Spotlight</h3>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-2xl font-bold">
            👑
          </div>
          <div>
            <h4 className="text-xl font-bold text-yellow-800">{summary.weeklyWinner.name}</h4>
            <p className="text-yellow-700">
              {summary.weeklyWinner.weeklyPoints} points • {summary.weeklyWinner.accuracy}% accuracy
            </p>
            <p className="text-sm text-yellow-600 mt-1">
              Favorite team: {summary.weeklyWinner.favoriteTeam}
            </p>
          </div>
        </div>
      </div>

      {/* Individual Performances */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold mb-4">🎭 Individual Performance Reviews</h3>
        <div className="space-y-4">
          {summary.performances.map((performance) => (
            <div key={performance.name} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold">
                    #{performance.weeklyRank}
                  </div>
                  <div>
                    <h4 className="font-semibold">{performance.name}</h4>
                    <p className="text-sm text-gray-600">{performance.weeklyPoints} points this week</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{performance.points}</div>
                  <div className="text-xs text-gray-500">total points</div>
                </div>
              </div>
              <p className="text-sm text-gray-700 italic">{performance.commentary}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fun Facts */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold mb-4">🤓 Fun Facts & Stats</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {summary.funFacts.map((fact, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700">{fact}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Next Week Predictions */}
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">🔮 Next Week's Bold Predictions</h3>
        <div className="space-y-2">
          {summary.predictions.map((prediction, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-purple-500 mt-1">•</span>
              <p className="text-gray-700">{prediction}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WeeklySummary;