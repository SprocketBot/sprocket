export interface EloInput {
    oldElo: number;
    goalDiff: number;
    numPlayers: number;
    mvpr: number;
    winProb: number;
    isWin: boolean;
    isScrim: boolean;
}

export enum TeamColor {
    ORANGE = 0,
    BLUE = 1,
}

export enum GameMode {
    DOUBLES = 0,
    STANDARD = 1,
}

export enum SkillGroups {
    FOUNDATION = 0,
    ACADEMY = 1,
    CHAMPION = 2,
    MASTER = 3,
    PREMIER = 4,
}

export enum SeriesType {
    Fixture = 0,
    Scrim = 1,
}

export const NUM_SKILL_GROUPS = 5;

export enum DegreeOfStiffness {
    SOFT = 0,
    FIRM = 1,
    HARD = 2,
}

export interface RankoutPayload {
    newSalary: number;
    sgDelta: number;
    degreeOfStiffness: DegreeOfStiffness;
}

export interface SalaryPayloadItem {
    playerId: number;
    newSalary: number;
    sgDelta: number;
    degreeOfStiffness: DegreeOfStiffness;
}

export interface SalaryJobPayload {
    jobType: string;
    data: SalaryPayloadItem[][];
}

export interface Player {
    pid: number;
}

export interface PlayerSummary {
    id: number;
    name: string;
    team: TeamColor;
    mvpr: number;
}

export interface MatchSummary {
    id: number;
    orangeWon: boolean;
    scoreOrange: number;
    scoreBlue: number;
    blue: PlayerSummary[];
    orange: PlayerSummary[];
}

export interface SeriesStatsPayload {
    id: number;
    numGames: number;
    isScrim: boolean;
    gameMode: GameMode;
    gameStats: MatchSummary[];
}

