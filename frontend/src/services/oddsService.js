// Betting odds integration service
// Fetches odds from multiple betting APIs and calculates probabilities

const BETTING_APIS = {
  // Free tier APIs for odds data
  ODDS_API: {
    url: 'https://api.the-odds-api.com/v4/sports/soccer_epl',
    key: process.env.REACT_APP_ODDS_API_KEY || 'demo-key'
  },
  
  // Alternative sources
  BETFAIR_API: {
    url: 'https://api.betfair.com/exchange/betting/rest/v1.0',
    key: process.env.REACT_APP_BETFAIR_KEY || 'demo-key'
  }
};

// Mock odds data for development/demo (would be replaced with real API calls)
const MOCK_LEAGUE_ODDS = {
  'Man City': {
    toFinish: {
      1: { odds: 1.5, probability: 66.7 },    // Favorites to win
      2: { odds: 6.0, probability: 16.7 },
      3: { odds: 12.0, probability: 8.3 },
      4: { odds: 25.0, probability: 4.0 },
      'top4': { odds: 1.1, probability: 90.9 },
      'relegated': { odds: 1000, probability: 0.1 }
    }
  },
  'Arsenal': {
    toFinish: {
      1: { odds: 3.5, probability: 28.6 },
      2: { odds: 2.8, probability: 35.7 },
      3: { odds: 4.5, probability: 22.2 },
      4: { odds: 7.0, probability: 14.3 },
      'top4': { odds: 1.4, probability: 71.4 },
      'relegated': { odds: 500, probability: 0.2 }
    }
  },
  'Liverpool': {
    toFinish: {
      1: { odds: 4.0, probability: 25.0 },
      2: { odds: 3.2, probability: 31.3 },
      3: { odds: 4.0, probability: 25.0 },
      4: { odds: 6.5, probability: 15.4 },
      'top4': { odds: 1.6, probability: 62.5 },
      'relegated': { odds: 750, probability: 0.13 }
    }
  },
  'Chelsea': {
    toFinish: {
      1: { odds: 12.0, probability: 8.3 },
      2: { odds: 6.5, probability: 15.4 },
      3: { odds: 4.5, probability: 22.2 },
      4: { odds: 3.0, probability: 33.3 },
      'top4': { odds: 2.2, probability: 45.5 },
      'relegated': { odds: 100, probability: 1.0 }
    }
  },
  'Man United': {
    toFinish: {
      1: { odds: 15.0, probability: 6.7 },
      2: { odds: 8.0, probability: 12.5 },
      3: { odds: 5.0, probability: 20.0 },
      4: { odds: 3.5, probability: 28.6 },
      'top4': { odds: 2.5, probability: 40.0 },
      'relegated': { odds: 80, probability: 1.25 }
    }
  },
  'Spurs': {
    toFinish: {
      1: { odds: 20.0, probability: 5.0 },
      2: { odds: 10.0, probability: 10.0 },
      3: { odds: 6.0, probability: 16.7 },
      4: { odds: 4.0, probability: 25.0 },
      'top4': { odds: 3.0, probability: 33.3 },
      'relegated': { odds: 50, probability: 2.0 }
    }
  },
  'Newcastle': {
    toFinish: {
      1: { odds: 25.0, probability: 4.0 },
      2: { odds: 12.0, probability: 8.3 },
      3: { odds: 7.0, probability: 14.3 },
      4: { odds: 5.0, probability: 20.0 },
      'top4': { odds: 4.0, probability: 25.0 },
      'relegated': { odds: 40, probability: 2.5 }
    }
  },
  'West Ham': {
    toFinish: {
      1: { odds: 100.0, probability: 1.0 },
      2: { odds: 40.0, probability: 2.5 },
      3: { odds: 20.0, probability: 5.0 },
      4: { odds: 12.0, probability: 8.3 },
      'top4': { odds: 8.0, probability: 12.5 },
      'relegated': { odds: 15, probability: 6.7 }
    }
  },
  'Brighton': {
    toFinish: {
      1: { odds: 150.0, probability: 0.67 },
      2: { odds: 50.0, probability: 2.0 },
      3: { odds: 25.0, probability: 4.0 },
      4: { odds: 15.0, probability: 6.7 },
      'top4': { odds: 12.0, probability: 8.3 },
      'relegated': { odds: 8, probability: 12.5 }
    }
  },
  'Aston Villa': {
    toFinish: {
      1: { odds: 80.0, probability: 1.25 },
      2: { odds: 30.0, probability: 3.3 },
      3: { odds: 15.0, probability: 6.7 },
      4: { odds: 10.0, probability: 10.0 },
      'top4': { odds: 10.0, probability: 10.0 },
      'relegated': { odds: 12, probability: 8.3 }
    }
  },
  'Burnley': {
    toFinish: {
      1: { odds: 1000.0, probability: 0.1 },
      2: { odds: 500.0, probability: 0.2 },
      3: { odds: 250.0, probability: 0.4 },
      4: { odds: 100.0, probability: 1.0 },
      'top4': { odds: 50.0, probability: 2.0 },
      'relegated': { odds: 2.5, probability: 40.0 }
    }
  },
  'Leeds United': {
    toFinish: {
      1: { odds: 750.0, probability: 0.13 },
      2: { odds: 300.0, probability: 0.33 },
      3: { odds: 150.0, probability: 0.67 },
      4: { odds: 75.0, probability: 1.33 },
      'top4': { odds: 40.0, probability: 2.5 },
      'relegated': { odds: 3.0, probability: 33.3 }
    }
  },
  'Sunderland': {
    toFinish: {
      1: { odds: 1500.0, probability: 0.067 },
      2: { odds: 750.0, probability: 0.13 },
      3: { odds: 400.0, probability: 0.25 },
      4: { odds: 200.0, probability: 0.5 },
      'top4': { odds: 100.0, probability: 1.0 },
      'relegated': { odds: 2.0, probability: 50.0 }
    }
  }
};

// Mock weekly match odds
const MOCK_WEEKLY_ODDS = {
  'Man City vs Arsenal': {
    homeWin: { odds: 1.8, probability: 55.6 },
    draw: { odds: 3.5, probability: 28.6 },
    awayWin: { odds: 4.5, probability: 22.2 },
    totalGoals: {
      over2_5: { odds: 1.6, probability: 62.5 },
      under2_5: { odds: 2.4, probability: 41.7 }
    },
    possession: {
      home: { expected: 65, odds: 1.9 },
      away: { expected: 35, odds: 1.9 }
    }
  }
};

export class OddsService {
  constructor() {
    this.cache = new Map();
    this.lastFetch = null;
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
  }

  // Fetch league table odds from betting APIs
  async fetchLeagueOdds() {
    try {
      // Check cache first
      if (this.isCacheValid('league-odds')) {
        return this.cache.get('league-odds');
      }

      // In production, this would be real API calls
      // const response = await fetch(`${BETTING_APIS.ODDS_API.url}/outright?apiKey=${BETTING_APIS.ODDS_API.key}&markets=h2h`);
      // const data = await response.json();

      // For now, return mock data with some randomization to simulate live odds
      const liveOdds = this.randomizeOdds(MOCK_LEAGUE_ODDS);
      
      this.cache.set('league-odds', liveOdds);
      this.lastFetch = Date.now();
      
      return liveOdds;
    } catch (error) {
      console.error('Error fetching league odds:', error);
      return MOCK_LEAGUE_ODDS; // Fallback to mock data
    }
  }

  // Fetch weekly match odds
  async fetchWeeklyMatchOdds(homeTeam, awayTeam) {
    try {
      const cacheKey = `match-${homeTeam}-${awayTeam}`;
      
      if (this.isCacheValid(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // In production, this would fetch specific match odds
      const matchKey = `${homeTeam} vs ${awayTeam}`;
      const odds = MOCK_WEEKLY_ODDS[matchKey] || this.generateMatchOdds(homeTeam, awayTeam);
      
      this.cache.set(cacheKey, odds);
      return odds;
    } catch (error) {
      console.error('Error fetching match odds:', error);
      return this.generateMatchOdds(homeTeam, awayTeam);
    }
  }

  // Calculate surprise level based on betting odds
  calculateSurpriseLevel(team, finalPosition, oddsData = null) {
    if (!oddsData) oddsData = MOCK_LEAGUE_ODDS;
    
    const teamOdds = oddsData[team];
    if (!teamOdds) return 'EXPECTED';

    const positionOdds = teamOdds.toFinish[finalPosition];
    if (!positionOdds) return 'EXPECTED';

    const probability = positionOdds.probability;
    
    // Classify surprise level based on probability
    if (probability < 2) return 'HUGE_SURPRISE';      // Less than 2% chance
    if (probability < 10) return 'BIG_SURPRISE';      // Less than 10% chance  
    if (probability < 25) return 'MILD_SURPRISE';     // Less than 25% chance
    return 'EXPECTED';                                // 25%+ chance
  }

  // Calculate multiplier based on odds
  calculateOddsMultiplier(team, finalPosition, oddsData = null) {
    const surpriseLevel = this.calculateSurpriseLevel(team, finalPosition, oddsData);
    
    const multipliers = {
      'HUGE_SURPRISE': 5.0,    // Increased for very unlikely outcomes
      'BIG_SURPRISE': 3.0,
      'MILD_SURPRISE': 1.8,
      'EXPECTED': 1.0
    };

    return multipliers[surpriseLevel];
  }

  // Get probability for specific team/position combination
  getPositionProbability(team, position) {
    const teamOdds = MOCK_LEAGUE_ODDS[team];
    if (!teamOdds) return 0;
    
    const positionData = teamOdds.toFinish[position];
    return positionData ? positionData.probability : 0;
  }

  // Convert decimal odds to probability
  oddsToProb(odds) {
    return (1 / odds) * 100;
  }

  // Convert probability to decimal odds
  probToOdds(probability) {
    return 100 / probability;
  }

  // Generate odds for teams not in mock data
  generateMatchOdds(homeTeam, awayTeam) {
    // Simple odds generation based on team strength
    const teamStrength = {
      'Man City': 95, 'Arsenal': 88, 'Liverpool': 87, 'Chelsea': 82,
      'Man United': 78, 'Spurs': 75, 'Newcastle': 72, 'West Ham': 65,
      'Brighton': 62, 'Aston Villa': 60, 'Burnley': 45, 'Leeds United': 48,
      'Sunderland': 42
    };

    const homeStrength = teamStrength[homeTeam] || 50;
    const awayStrength = teamStrength[awayTeam] || 50;
    
    // Add home advantage
    const adjustedHome = homeStrength + 5;
    const total = adjustedHome + awayStrength;
    
    const homeWinProb = (adjustedHome / total) * 70; // Max 70% for any team
    const awayWinProb = (awayStrength / total) * 70;
    const drawProb = 100 - homeWinProb - awayWinProb;

    return {
      homeWin: { odds: this.probToOdds(homeWinProb), probability: homeWinProb },
      draw: { odds: this.probToOdds(drawProb), probability: drawProb },
      awayWin: { odds: this.probToOdds(awayWinProb), probability: awayWinProb },
      possession: {
        home: { expected: Math.round(45 + (homeStrength - awayStrength) * 0.2) },
        away: { expected: Math.round(55 - (homeStrength - awayStrength) * 0.2) }
      }
    };
  }

  // Add small random variations to odds to simulate live changes
  randomizeOdds(baseOdds) {
    const randomized = {};
    
    for (const [team, odds] of Object.entries(baseOdds)) {
      randomized[team] = {
        toFinish: {}
      };
      
      for (const [position, data] of Object.entries(odds.toFinish)) {
        const variation = 0.9 + Math.random() * 0.2; // ±10% variation
        randomized[team].toFinish[position] = {
          odds: Math.round(data.odds * variation * 100) / 100,
          probability: Math.round(data.probability / variation * 10) / 10
        };
      }
    }
    
    return randomized;
  }

  // Check if cached data is still valid
  isCacheValid(key) {
    return this.cache.has(key) && 
           this.lastFetch && 
           (Date.now() - this.lastFetch) < this.cacheDuration;
  }

  // Get real-time odds summary for display
  async getOddsSummary() {
    const leagueOdds = await this.fetchLeagueOdds();
    
    return {
      favorites: this.getTopFavorites(leagueOdds),
      longshots: this.getLongshots(leagueOdds),
      relegationFavorites: this.getRelegationFavorites(leagueOdds),
      lastUpdated: new Date().toISOString()
    };
  }

  getTopFavorites(odds) {
    return Object.entries(odds)
      .map(([team, data]) => ({
        team,
        probability: data.toFinish[1]?.probability || 0,
        odds: data.toFinish[1]?.odds || 999
      }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 3);
  }

  getLongshots(odds) {
    return Object.entries(odds)
      .map(([team, data]) => ({
        team,
        probability: data.toFinish['top4']?.probability || 0,
        odds: data.toFinish['top4']?.odds || 999
      }))
      .filter(item => item.probability < 15) // Less than 15% chance
      .sort((a, b) => a.probability - b.probability)
      .slice(0, 3);
  }

  getRelegationFavorites(odds) {
    return Object.entries(odds)
      .map(([team, data]) => ({
        team,
        probability: data.toFinish['relegated']?.probability || 0,
        odds: data.toFinish['relegated']?.odds || 999
      }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 3);
  }
}

export const oddsService = new OddsService();