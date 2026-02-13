export type AchievementStats = {
    soloPlays: number;
    versusPlays: number;
    versusWinsP1: number;      // Player 1 wins (or total wins if tracking user)
    highestAltitude: number;   // All-time highest altitude
    highestTotalAltitude: number; // Highest total altitude in a single game
    everestCount: number;      // Count of rounds with >= 8000m
    snowCount: number;         // Count of rounds with >= 6000m
    maxWinMargin: number;      // Maximum score difference in a win
    winStreakBest: number;     // Best win streak (optional)
};

export const INITIAL_STATS: AchievementStats = {
    soloPlays: 0,
    versusPlays: 0,
    versusWinsP1: 0,
    highestAltitude: 0,
    highestTotalAltitude: 0,
    everestCount: 0,
    snowCount: 0,
    maxWinMargin: 0,
    winStreakBest: 0,
};
