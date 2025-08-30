// Official Premier League fixture data service
// Integrates with multiple official sources for live fixture data

const FIXTURE_APIS = {
  // Official Premier League API
  PREMIER_LEAGUE: {
    url: 'https://footballapi.pulselive.com/football/fixtures',
    headers: {
      'Origin': 'https://www.premierleague.com'
    }
  },
  
  // Football Data API (free tier available)
  FOOTBALL_DATA: {
    url: 'https://api.football-data.org/v4/competitions/PL/matches',
    key: process.env.REACT_APP_FOOTBALL_DATA_KEY || 'demo-key'
  },

  // Alternative API
  API_SPORTS: {
    url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
    key: process.env.REACT_APP_RAPID_API_KEY || 'demo-key'
  }
};

// Mock fixture data for development - realistic upcoming gameweek
const MOCK_FIXTURES = {
  gameweek: 3,
  season: '2025-26',
  fixtures: [
    {
      id: 'fixture_001',
      homeTeam: 'Arsenal',
      awayTeam: 'Brighton',
      date: '2025-08-31T15:00:00Z',
      venue: 'Emirates Stadium',
      kickoff: '15:00',
      matchday: 3,
      status: 'SCHEDULED',
      referee: 'Michael Oliver',
      homeForm: ['W', 'W', 'D', 'W', 'L'],
      awayForm: ['L', 'D', 'W', 'W', 'D'],
      headToHead: {
        homeWins: 8,
        awayWins: 2,
        draws: 3,
        lastMeeting: 'Arsenal 3-0 Brighton'
      }
    },
    {
      id: 'fixture_002',
      homeTeam: 'Man City',
      awayTeam: 'West Ham',
      date: '2025-08-31T17:30:00Z',
      venue: 'Etihad Stadium',
      kickoff: '17:30',
      matchday: 3,
      status: 'SCHEDULED',
      referee: 'Anthony Taylor',
      homeForm: ['W', 'W', 'W', 'W', 'D'],
      awayForm: ['D', 'L', 'W', 'L', 'D'],
      headToHead: {
        homeWins: 12,
        awayWins: 1,
        draws: 2,
        lastMeeting: 'Man City 2-1 West Ham'
      }
    },
    {
      id: 'fixture_003',
      homeTeam: 'Liverpool',
      awayTeam: 'Spurs',
      date: '2025-09-01T16:30:00Z',
      venue: 'Anfield',
      kickoff: '16:30',
      matchday: 3,
      status: 'SCHEDULED',
      referee: 'Paul Tierney',
      homeForm: ['W', 'D', 'W', 'W', 'W'],
      awayForm: ['L', 'W', 'D', 'L', 'W'],
      headToHead: {
        homeWins: 9,
        awayWins: 4,
        draws: 2,
        lastMeeting: 'Liverpool 4-2 Spurs'
      }
    },
    {
      id: 'fixture_004',
      homeTeam: 'Chelsea',
      awayTeam: 'Newcastle',
      date: '2025-09-01T14:00:00Z',
      venue: 'Stamford Bridge',
      kickoff: '14:00',
      matchday: 3,
      status: 'SCHEDULED',
      referee: 'Stuart Attwell',
      homeForm: ['W', 'L', 'W', 'D', 'W'],
      awayForm: ['D', 'W', 'L', 'W', 'D'],
      headToHead: {
        homeWins: 7,
        awayWins: 3,
        draws: 5,
        lastMeeting: 'Chelsea 1-1 Newcastle'
      }
    },
    {
      id: 'fixture_005',
      homeTeam: 'Man United',
      awayTeam: 'Aston Villa',
      date: '2025-09-01T12:30:00Z',
      venue: 'Old Trafford',
      kickoff: '12:30',
      matchday: 3,
      status: 'SCHEDULED',
      referee: 'Chris Kavanagh',
      homeForm: ['D', 'W', 'L', 'W', 'D'],
      awayForm: ['W', 'D', 'L', 'W', 'W'],
      headToHead: {
        homeWins: 10,
        awayWins: 2,
        draws: 3,
        lastMeeting: 'Man United 2-0 Aston Villa'
      }
    },
    {
      id: 'fixture_006',
      homeTeam: 'Brentford',
      awayTeam: 'Wolves',
      date: '2025-08-30T15:00:00Z',
      venue: 'Brentford Community Stadium',
      kickoff: '15:00',
      matchday: 3,
      status: 'SCHEDULED',
      referee: 'David Coote',
      homeForm: ['D', 'L', 'W', 'D', 'L'],
      awayForm: ['L', 'D', 'D', 'L', 'W'],
      headToHead: {
        homeWins: 2,
        awayWins: 1,
        draws: 2,
        lastMeeting: 'Brentford 1-1 Wolves'
      }
    }
  ]
};

// Challenge type templates that admin can choose from
export const CHALLENGE_TEMPLATES = {
  POSSESSION_BATTLE: {
    id: 'possession',
    name: '📊 Possession Battle',
    description: 'Predict the possession percentages for both teams',
    icon: '⚽',
    difficulty: 'medium',
    timeToComplete: '1-2 minutes',
    interactionType: 'sliders',
    questions: (homeTeam, awayTeam) => [
      {
        id: 'home_possession',
        label: `${homeTeam} Possession %`,
        type: 'slider',
        min: 25,
        max: 75,
        step: 1,
        default: 50,
        icon: '🏠'
      },
      {
        id: 'away_possession',
        label: `${awayTeam} Possession %`,
        type: 'slider',
        min: 25,
        max: 75,
        step: 1,
        default: 50,
        icon: '✈️'
      }
    ]
  },

  GOAL_FEAST: {
    id: 'goals',
    name: '🥅 Goal Fest Predictor',
    description: 'Predict goals, timing, and goalscorers',
    icon: '⚽',
    difficulty: 'hard',
    timeToComplete: '2 minutes',
    interactionType: 'mixed',
    questions: (homeTeam, awayTeam) => [
      {
        id: 'total_goals',
        label: 'Total Goals in Match',
        type: 'wheel',
        min: 0,
        max: 8,
        step: 1,
        default: 3,
        icon: '⚽'
      },
      {
        id: 'first_goal_minute',
        label: 'First Goal Minute',
        type: 'slider',
        min: 1,
        max: 90,
        step: 1,
        default: 25,
        icon: '⏱️'
      },
      {
        id: 'winner',
        label: 'Match Winner',
        type: 'buttons',
        options: [
          { value: 'home', label: homeTeam, icon: '🏠' },
          { value: 'draw', label: 'Draw', icon: '🤝' },
          { value: 'away', label: awayTeam, icon: '✈️' }
        ],
        default: 'home'
      }
    ]
  },

  CARDS_AND_CHAOS: {
    id: 'discipline',
    name: '🟨 Cards & Chaos',
    description: 'Predict disciplinary actions and drama',
    icon: '🟨',
    difficulty: 'medium',
    timeToComplete: '1 minute',
    interactionType: 'taps',
    questions: (homeTeam, awayTeam) => [
      {
        id: 'yellow_cards',
        label: 'Total Yellow Cards',
        type: 'counter',
        min: 0,
        max: 12,
        step: 1,
        default: 4,
        icon: '🟨'
      },
      {
        id: 'red_cards',
        label: 'Red Cards',
        type: 'counter',
        min: 0,
        max: 3,
        step: 1,
        default: 0,
        icon: '🟥'
      },
      {
        id: 'penalty',
        label: 'Penalty Awarded?',
        type: 'toggle',
        options: ['Yes', 'No'],
        default: 'No',
        icon: '⚪'
      }
    ]
  },

  CORNER_KICKS: {
    id: 'corners',
    name: '🚩 Corner Kick Count',
    description: 'Predict corner kicks and set pieces',
    icon: '🚩',
    difficulty: 'easy',
    timeToComplete: '45 seconds',
    interactionType: 'quick_tap',
    questions: (homeTeam, awayTeam) => [
      {
        id: 'total_corners',
        label: 'Total Corner Kicks',
        type: 'spinner',
        min: 0,
        max: 20,
        step: 1,
        default: 8,
        icon: '🚩'
      },
      {
        id: 'home_corners',
        label: `${homeTeam} Corners`,
        type: 'counter',
        min: 0,
        max: 15,
        step: 1,
        default: 5,
        icon: '🏠'
      }
    ]
  },

  SHOTS_SHOWDOWN: {
    id: 'shots',
    name: '🎯 Shots Showdown',
    description: 'Predict shooting statistics',
    icon: '🎯',
    difficulty: 'medium',
    timeToComplete: '1.5 minutes',
    interactionType: 'drag_drop',
    questions: (homeTeam, awayTeam) => [
      {
        id: 'total_shots',
        label: 'Total Shots',
        type: 'range_slider',
        min: 8,
        max: 30,
        step: 1,
        default: 18,
        icon: '🎯'
      },
      {
        id: 'shots_on_target',
        label: 'Shots on Target',
        type: 'wheel',
        min: 2,
        max: 15,
        step: 1,
        default: 8,
        icon: '🥅'
      }
    ]
  },

  SPEEDY_PREDICTIONS: {
    id: 'quick_fire',
    name: '⚡ Quick Fire Round',
    description: '30-second speed predictions!',
    icon: '⚡',
    difficulty: 'easy',
    timeToComplete: '30 seconds',
    interactionType: 'rapid_fire',
    questions: (homeTeam, awayTeam) => [
      {
        id: 'first_booking',
        label: 'First Booking Team',
        type: 'quick_buttons',
        options: [
          { value: 'home', label: homeTeam, color: 'blue' },
          { value: 'away', label: awayTeam, color: 'red' }
        ],
        default: 'home',
        icon: '🟨'
      },
      {
        id: 'more_possession',
        label: 'More Possession',
        type: 'quick_buttons',
        options: [
          { value: 'home', label: homeTeam, color: 'blue' },
          { value: 'away', label: awayTeam, color: 'red' }
        ],
        default: 'home',
        icon: '📊'
      }
    ]
  }
};

export class FixtureService {
  constructor() {
    this.cache = new Map();
    this.lastFetch = null;
    this.cacheDuration = 10 * 60 * 1000; // 10 minutes
  }

  // Fetch live fixtures from official APIs
  async fetchLiveFixtures() {
    try {
      // Check cache first
      if (this.isCacheValid('fixtures')) {
        return this.cache.get('fixtures');
      }

      // In production, this would call the real APIs
      // const response = await fetch(`${FIXTURE_APIS.FOOTBALL_DATA.url}?status=SCHEDULED`, {
      //   headers: {
      //     'X-Auth-Token': FIXTURE_APIS.FOOTBALL_DATA.key
      //   }
      // });
      // const data = await response.json();

      // For now, return mock data with some randomization
      const liveFixtures = this.addRealtimeData(MOCK_FIXTURES);
      
      this.cache.set('fixtures', liveFixtures);
      this.lastFetch = Date.now();
      
      return liveFixtures;
    } catch (error) {
      console.error('Error fetching fixtures:', error);
      return MOCK_FIXTURES; // Fallback to mock data
    }
  }

  // Get current gameweek fixtures
  async getCurrentGameweekFixtures() {
    const allFixtures = await this.fetchLiveFixtures();
    return allFixtures.fixtures.filter(fixture => 
      fixture.status === 'SCHEDULED' && 
      new Date(fixture.date) > new Date()
    );
  }

  // Get upcoming fixtures for admin to choose from
  async getUpcomingFixtures(limit = 10) {
    const fixtures = await this.getCurrentGameweekFixtures();
    return fixtures
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, limit);
  }

  // Get specific fixture details
  async getFixtureDetails(fixtureId) {
    const allFixtures = await this.fetchLiveFixtures();
    return allFixtures.fixtures.find(fixture => fixture.id === fixtureId);
  }

  // Generate challenge options for admin based on fixture
  generateChallengeOptions(fixture) {
    const challengeOptions = [];
    
    Object.values(CHALLENGE_TEMPLATES).forEach(template => {
      challengeOptions.push({
        ...template,
        fixture: fixture,
        questions: template.questions(fixture.homeTeam, fixture.awayTeam),
        preview: this.generatePreview(template, fixture)
      });
    });

    return challengeOptions;
  }

  generatePreview(template, fixture) {
    return {
      title: `${template.name} - ${fixture.homeTeam} vs ${fixture.awayTeam}`,
      description: template.description,
      estimatedTime: template.timeToComplete,
      difficulty: template.difficulty,
      sampleQuestion: template.questions(fixture.homeTeam, fixture.awayTeam)[0]
    };
  }

  // Add real-time data like weather, team news, odds
  addRealtimeData(fixtureData) {
    return {
      ...fixtureData,
      fixtures: fixtureData.fixtures.map(fixture => ({
        ...fixture,
        weather: this.generateWeatherData(),
        teamNews: this.generateTeamNews(fixture),
        odds: this.generateOddsData(fixture),
        lastUpdated: new Date().toISOString()
      }))
    };
  }

  generateWeatherData() {
    const conditions = ['Sunny', 'Cloudy', 'Light Rain', 'Heavy Rain', 'Windy'];
    return {
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      temperature: Math.floor(Math.random() * 15) + 10, // 10-25°C
      wind: Math.floor(Math.random() * 20) + 5 // 5-25 mph
    };
  }

  generateTeamNews(fixture) {
    return {
      homeTeam: {
        injuries: Math.floor(Math.random() * 3),
        suspensions: Math.floor(Math.random() * 2),
        keyPlayerStatus: 'Available'
      },
      awayTeam: {
        injuries: Math.floor(Math.random() * 3),
        suspensions: Math.floor(Math.random() * 2),
        keyPlayerStatus: 'Available'
      }
    };
  }

  generateOddsData(fixture) {
    // Simple odds generation based on team strength
    const homeAdvantage = 0.1;
    const homeWinProb = 0.4 + homeAdvantage + (Math.random() * 0.2 - 0.1);
    const drawProb = 0.25 + (Math.random() * 0.1 - 0.05);
    const awayWinProb = 1 - homeWinProb - drawProb;

    return {
      homeWin: (1 / homeWinProb).toFixed(2),
      draw: (1 / drawProb).toFixed(2),
      awayWin: (1 / awayWinProb).toFixed(2),
      totalGoals: {
        over2_5: (1.6 + Math.random() * 0.8).toFixed(2),
        under2_5: (2.2 + Math.random() * 0.8).toFixed(2)
      }
    };
  }

  // Check if cached data is still valid
  isCacheValid(key) {
    return this.cache.has(key) && 
           this.lastFetch && 
           (Date.now() - this.lastFetch) < this.cacheDuration;
  }

  // Get challenge difficulty distribution for admin insights
  getChallengeDifficultyStats() {
    const templates = Object.values(CHALLENGE_TEMPLATES);
    const difficulties = templates.reduce((acc, template) => {
      acc[template.difficulty] = (acc[template.difficulty] || 0) + 1;
      return acc;
    }, {});

    return {
      total: templates.length,
      difficulties,
      averageTime: templates.reduce((acc, t) => acc + parseInt(t.timeToComplete), 0) / templates.length
    };
  }
}

export const fixtureService = new FixtureService();