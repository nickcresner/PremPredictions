// Advanced scoring system for Premier League predictions
// Now integrates with live betting odds for dynamic probability-based scoring

import { oddsService } from '../services/oddsService';

export const LEAGUE_PREDICTION_POINTS = {
  // Main season predictions - heavily weighted
  EXACT_POSITION: 100,      // Predicted team in exact final position
  OFF_BY_ONE: 60,           // One position off
  OFF_BY_TWO: 30,           // Two positions off  
  OFF_BY_THREE: 15,         // Three positions off
  CORRECT_SECTION: 10,      // Right section (top 4, mid-table, relegation) but wrong position
  COMPLETELY_WRONG: 0,      // Wrong section entirely

  // Dynamic multipliers based on live betting odds
  ODDS_BASED_MULTIPLIERS: {
    // Probability-based multipliers from betting odds
    ASTRONOMICAL: 10.0,     // <0.5% probability (1000+ odds)
    HUGE_SURPRISE: 5.0,     // <2% probability (50+ odds)
    BIG_SURPRISE: 3.0,      // <10% probability (10+ odds)
    MILD_SURPRISE: 1.8,     // <25% probability (4+ odds)
    EXPECTED: 1.0           // 25%+ probability
  },

  // Special achievements
  PERFECT_TOP_4: 500,       // All top 4 teams in exact order
  PERFECT_RELEGATION: 300,  // All bottom 3 teams in exact order
  PERFECT_TOP_8: 1000,      // All top 8 teams in exact order (legendary)
  UNDERDOG_BONUS: 200,      // Correctly predicting promoted team survival

  // Favorite team multipliers
  FAVORITE_TEAM_MULTIPLIERS: {
    GREAT_SUCCESS: 2.5,     // Favorite team finishes 5+ positions better than predicted
    SUCCESS: 1.8,           // Favorite team finishes 2-4 positions better than predicted  
    MILD_SUCCESS: 1.3,      // Favorite team finishes 1 position better than predicted
    NEUTRAL: 1.0,           // Favorite team finishes exactly where predicted
    MILD_DISAPPOINTMENT: 0.7, // Favorite team finishes 1 position worse than predicted
    DISAPPOINTMENT: 0.4,    // Favorite team finishes 2-4 positions worse than predicted
    DISASTER: 0.2          // Favorite team finishes 5+ positions worse than predicted
  }
};

export const WEEKLY_CHALLENGE_POINTS = {
  BASE_POINTS: 50,
  PERFECT_PREDICTION: 200,   // Exactly correct
  VERY_CLOSE: 100,          // Within 5% or 1 unit
  CLOSE: 75,                // Within 10% or 2 units  
  DECENT: 50,               // Within 20% or 3 units
  POOR: 25,                 // Within 50% or 5 units
  TERRIBLE: 0               // More than 50% off
};

// Calculate league prediction score using live betting odds and favorite team multiplier
export async function calculateLeaguePredictionScore(prediction, actualFinalTable, useOdds = true) {
  let totalScore = 0;
  const teamScores = {};

  // Calculate scores for each predicted position
  prediction.topEight.forEach((pred, index) => {
    const predictedPosition = index + 1;
    const actualPosition = actualFinalTable.findIndex(team => team === pred.team) + 1;
    
    if (actualPosition === 0) {
      teamScores[pred.team] = { score: 0, reason: 'Team not found in final table' };
      return;
    }

    const positionDiff = Math.abs(actualPosition - predictedPosition);
    let baseScore = 0;
    let reason = '';

    if (positionDiff === 0) {
      baseScore = LEAGUE_PREDICTION_POINTS.EXACT_POSITION;
      reason = `Perfect! ${pred.team} finished exactly ${actualPosition}`;
    } else if (positionDiff === 1) {
      baseScore = LEAGUE_PREDICTION_POINTS.OFF_BY_ONE;
      reason = `Close! ${pred.team} finished ${actualPosition} (predicted ${predictedPosition})`;
    } else if (positionDiff === 2) {
      baseScore = LEAGUE_PREDICTION_POINTS.OFF_BY_TWO;
      reason = `Good guess! Off by 2 positions`;
    } else if (positionDiff === 3) {
      baseScore = LEAGUE_PREDICTION_POINTS.OFF_BY_THREE;
      reason = `Decent! Off by 3 positions`;
    } else if (isInCorrectSection(predictedPosition, actualPosition)) {
      baseScore = LEAGUE_PREDICTION_POINTS.CORRECT_SECTION;
      reason = `Right section, wrong position`;
    } else {
      baseScore = LEAGUE_PREDICTION_POINTS.COMPLETELY_WRONG;
      reason = `Way off! Wrong section entirely`;
    }

    // Apply odds-based multiplier
    let multiplier = 1.0;
    let surprise = 'EXPECTED';
    
    if (useOdds) {
      try {
        const probability = oddsService.getPositionProbability(pred.team, actualPosition);
        multiplier = calculateOddsMultiplier(probability);
        surprise = getSurpriseLevelFromProbability(probability);
      } catch (error) {
        console.warn('Could not fetch odds, using fallback multiplier:', error);
        surprise = calculateSurpriseLevelFallback(pred.team, actualPosition);
        multiplier = LEAGUE_PREDICTION_POINTS.ODDS_BASED_MULTIPLIERS[surprise];
      }
    } else {
      surprise = calculateSurpriseLevelFallback(pred.team, actualPosition);
      multiplier = LEAGUE_PREDICTION_POINTS.ODDS_BASED_MULTIPLIERS[surprise];
    }

    const finalScore = Math.round(baseScore * multiplier);

    if (multiplier > 1.0) {
      reason += ` + ${surprise} bonus (${multiplier}x multiplier)!`;
    }

    teamScores[pred.team] = { score: finalScore, reason, surprise, multiplier };
    totalScore += finalScore;
  });

  // Calculate relegation predictions
  prediction.bottomThree.forEach((pred, index) => {
    const predictedPosition = index + 18;
    const actualPosition = actualFinalTable.findIndex(team => team === pred.team) + 1;
    
    if (actualPosition === 0) return;

    const positionDiff = Math.abs(actualPosition - predictedPosition);
    let baseScore = 0;
    let reason = '';

    if (positionDiff === 0) {
      baseScore = LEAGUE_PREDICTION_POINTS.EXACT_POSITION;
      reason = `Perfect relegation prediction!`;
    } else if (actualPosition >= 18 && actualPosition <= 20) {
      baseScore = LEAGUE_PREDICTION_POINTS.CORRECT_SECTION;
      reason = `Correct relegation, wrong order`;
    } else {
      baseScore = LEAGUE_PREDICTION_POINTS.COMPLETELY_WRONG;
      reason = `Wrong! Team avoided relegation`;
    }

    teamScores[pred.team] = { score: baseScore, reason };
    totalScore += baseScore;
  });

  // Check for perfect sections
  const perfectTop4 = checkPerfectSection(prediction.topEight.slice(0, 4), actualFinalTable.slice(0, 4));
  const perfectRelegation = checkPerfectSection(
    prediction.bottomThree.map(p => p.team), 
    actualFinalTable.slice(17, 20)
  );
  const perfectTop8 = checkPerfectSection(
    prediction.topEight.map(p => p.team), 
    actualFinalTable.slice(0, 8)
  );

  let bonusPoints = 0;
  if (perfectTop8) {
    bonusPoints += LEAGUE_PREDICTION_POINTS.PERFECT_TOP_8;
    teamScores['PERFECT_TOP_8'] = { score: LEAGUE_PREDICTION_POINTS.PERFECT_TOP_8, reason: '🏆 LEGENDARY: Perfect Top 8!' };
  } else if (perfectTop4) {
    bonusPoints += LEAGUE_PREDICTION_POINTS.PERFECT_TOP_4;
    teamScores['PERFECT_TOP_4'] = { score: LEAGUE_PREDICTION_POINTS.PERFECT_TOP_4, reason: '🥇 Perfect Top 4!' };
  }

  if (perfectRelegation) {
    bonusPoints += LEAGUE_PREDICTION_POINTS.PERFECT_RELEGATION;
    teamScores['PERFECT_RELEGATION'] = { score: LEAGUE_PREDICTION_POINTS.PERFECT_RELEGATION, reason: '💀 Perfect Relegation Prediction!' };
  }

  // Apply favorite team multiplier if favorite team is selected
  let favoriteMultiplier = 1.0;
  let favoriteTeamPerformance = '';
  
  if (prediction.favoriteTeam) {
    const predictedPosition = prediction.topEight.findIndex(t => t.team === prediction.favoriteTeam) + 1 ||
                            prediction.bottomThree.findIndex(t => t.team === prediction.favoriteTeam) + 18 ||
                            10; // Default middle position if not in predictions
    
    const actualPosition = actualFinalTable.findIndex(team => team === prediction.favoriteTeam) + 1;
    
    if (actualPosition > 0) {
      const positionDifference = predictedPosition - actualPosition; // Positive = better than predicted
      
      if (positionDifference >= 5) {
        favoriteMultiplier = LEAGUE_PREDICTION_POINTS.FAVORITE_TEAM_MULTIPLIERS.GREAT_SUCCESS;
        favoriteTeamPerformance = 'GREAT_SUCCESS';
      } else if (positionDifference >= 2) {
        favoriteMultiplier = LEAGUE_PREDICTION_POINTS.FAVORITE_TEAM_MULTIPLIERS.SUCCESS;
        favoriteTeamPerformance = 'SUCCESS';
      } else if (positionDifference === 1) {
        favoriteMultiplier = LEAGUE_PREDICTION_POINTS.FAVORITE_TEAM_MULTIPLIERS.MILD_SUCCESS;
        favoriteTeamPerformance = 'MILD_SUCCESS';
      } else if (positionDifference === 0) {
        favoriteMultiplier = LEAGUE_PREDICTION_POINTS.FAVORITE_TEAM_MULTIPLIERS.NEUTRAL;
        favoriteTeamPerformance = 'NEUTRAL';
      } else if (positionDifference === -1) {
        favoriteMultiplier = LEAGUE_PREDICTION_POINTS.FAVORITE_TEAM_MULTIPLIERS.MILD_DISAPPOINTMENT;
        favoriteTeamPerformance = 'MILD_DISAPPOINTMENT';
      } else if (positionDifference >= -4) {
        favoriteMultiplier = LEAGUE_PREDICTION_POINTS.FAVORITE_TEAM_MULTIPLIERS.DISAPPOINTMENT;
        favoriteTeamPerformance = 'DISAPPOINTMENT';
      } else {
        favoriteMultiplier = LEAGUE_PREDICTION_POINTS.FAVORITE_TEAM_MULTIPLIERS.DISASTER;
        favoriteTeamPerformance = 'DISASTER';
      }
      
      teamScores[`FAVORITE_${prediction.favoriteTeam}`] = {
        score: 0,
        reason: `❤️ ${prediction.favoriteTeam} performance: ${favoriteTeamPerformance} (${favoriteMultiplier}x multiplier)`,
        multiplier: favoriteMultiplier
      };
    }
  }

  const finalScore = Math.round((totalScore + bonusPoints) * favoriteMultiplier);

  return {
    totalScore: finalScore,
    baseScore: totalScore + bonusPoints,
    teamScores,
    bonusPoints,
    favoriteTeamMultiplier: favoriteMultiplier,
    favoriteTeamPerformance,
    perfectSections: { top4: perfectTop4, relegation: perfectRelegation, top8: perfectTop8 }
  };
}

// Calculate weekly challenge score based on distance from correct answer
export function calculateWeeklyChallengeScore(userAnswer, correctAnswer, challengeType = 'number') {
  if (challengeType === 'percentage') {
    const diff = Math.abs(userAnswer - correctAnswer);
    if (diff === 0) return WEEKLY_CHALLENGE_POINTS.PERFECT_PREDICTION;
    if (diff <= 5) return WEEKLY_CHALLENGE_POINTS.VERY_CLOSE;
    if (diff <= 10) return WEEKLY_CHALLENGE_POINTS.CLOSE;
    if (diff <= 20) return WEEKLY_CHALLENGE_POINTS.DECENT;
    if (diff <= 50) return WEEKLY_CHALLENGE_POINTS.POOR;
    return WEEKLY_CHALLENGE_POINTS.TERRIBLE;
  }

  if (challengeType === 'number') {
    const diff = Math.abs(userAnswer - correctAnswer);
    if (diff === 0) return WEEKLY_CHALLENGE_POINTS.PERFECT_PREDICTION;
    if (diff === 1) return WEEKLY_CHALLENGE_POINTS.VERY_CLOSE;
    if (diff === 2) return WEEKLY_CHALLENGE_POINTS.CLOSE;
    if (diff <= 3) return WEEKLY_CHALLENGE_POINTS.DECENT;
    if (diff <= 5) return WEEKLY_CHALLENGE_POINTS.POOR;
    return WEEKLY_CHALLENGE_POINTS.TERRIBLE;
  }

  return WEEKLY_CHALLENGE_POINTS.BASE_POINTS;
}

// Determine if prediction is in correct section (top 4, Europa, mid-table, relegation)
function isInCorrectSection(predictedPos, actualPos) {
  const sections = {
    top4: [1, 2, 3, 4],
    europa: [5, 6, 7, 8],
    midTable: [9, 10, 11, 12, 13, 14, 15, 16, 17],
    relegation: [18, 19, 20]
  };

  for (const [section, positions] of Object.entries(sections)) {
    if (positions.includes(predictedPos) && positions.includes(actualPos)) {
      return true;
    }
  }
  return false;
}

// Calculate odds-based multiplier from probability
function calculateOddsMultiplier(probability) {
  if (probability < 0.5) return LEAGUE_PREDICTION_POINTS.ODDS_BASED_MULTIPLIERS.ASTRONOMICAL;
  if (probability < 2) return LEAGUE_PREDICTION_POINTS.ODDS_BASED_MULTIPLIERS.HUGE_SURPRISE;
  if (probability < 10) return LEAGUE_PREDICTION_POINTS.ODDS_BASED_MULTIPLIERS.BIG_SURPRISE;
  if (probability < 25) return LEAGUE_PREDICTION_POINTS.ODDS_BASED_MULTIPLIERS.MILD_SURPRISE;
  return LEAGUE_PREDICTION_POINTS.ODDS_BASED_MULTIPLIERS.EXPECTED;
}

// Get surprise level description from probability
function getSurpriseLevelFromProbability(probability) {
  if (probability < 0.5) return 'ASTRONOMICAL';
  if (probability < 2) return 'HUGE_SURPRISE';
  if (probability < 10) return 'BIG_SURPRISE';
  if (probability < 25) return 'MILD_SURPRISE';
  return 'EXPECTED';
}

// Fallback surprise calculation when odds not available
function calculateSurpriseLevelFallback(team, finalPosition) {
  // Historical expectations - would be updated based on bookmaker odds
  const teamExpectations = {
    'Man City': { min: 1, max: 3 },
    'Arsenal': { min: 2, max: 5 },
    'Liverpool': { min: 2, max: 5 },
    'Chelsea': { min: 3, max: 8 },
    'Man United': { min: 4, max: 10 },
    'Spurs': { min: 5, max: 12 },
    'Newcastle': { min: 6, max: 14 },
    'West Ham': { min: 8, max: 16 },
    'Brighton': { min: 10, max: 18 },
    'Aston Villa': { min: 8, max: 15 },
    'Burnley': { min: 15, max: 20 },
    'Leeds United': { min: 12, max: 20 },
    'Sunderland': { min: 16, max: 20 }
  };

  const expected = teamExpectations[team];
  if (!expected) return 'EXPECTED';

  const expectedRange = expected.max - expected.min;
  const deviation = Math.min(
    Math.abs(finalPosition - expected.min),
    Math.abs(finalPosition - expected.max)
  );

  if (finalPosition < expected.min || finalPosition > expected.max) {
    if (deviation > expectedRange * 2) return 'HUGE_SURPRISE';
    if (deviation > expectedRange) return 'BIG_SURPRISE';
    return 'MILD_SURPRISE';
  }

  return 'EXPECTED';
}

// Check if predicted section matches actual result exactly
function checkPerfectSection(predicted, actual) {
  if (predicted.length !== actual.length) return false;
  return predicted.every((team, index) => team === actual[index]);
}