import type {MatchSummary} from "./elo-connector";
import {
    GameMode, TeamColor,
} from "./elo-connector";

/* eslint-disable */
const match1: MatchSummary = {
    id: 1,
    orangeWon: true,
    scoreOrange: 2,
    scoreBlue: 1,
    orange: [
        {
            id: 1,
            name: "Nigel Thornbrake",
            team: TeamColor.ORANGE,
            mvpr: 4.65,
        },
        {
            id: 2,
            name: "Shuckle",
            team: TeamColor.ORANGE,
            mvpr: 3.25,
        },
    ],
    blue: [
        {
            id: 3,
            name: "HyperCoder",
            team: TeamColor.BLUE,
            mvpr: 2.75,
        },
        {
            id: 4,
            name: "CodeRedJack",
            team: TeamColor.BLUE,
            mvpr: 1.65,
        },
    ],
};

const match2: MatchSummary = {
    id: 2,
    orangeWon: true,
    scoreOrange: 2,
    scoreBlue: 1,
    orange: [
        {
            id: 1,
            name: "Nigel Thornbrake",
            team: TeamColor.ORANGE,
            mvpr: 4.65,
        },
        {
            id: 2,
            name: "Shuckle",
            team: TeamColor.ORANGE,
            mvpr: 3.25,
        },
    ],
    blue: [
        {
            id: 3,
            name: "HyperCoder",
            team: TeamColor.BLUE,
            mvpr: 2.75,
        },
        {
            id: 4,
            name: "CodeRedJack",
            team: TeamColor.BLUE,
            mvpr: 1.65,
        },
    ],
};

const match3: MatchSummary = {
    id: 3,
    orangeWon: true,
    scoreOrange: 2,
    scoreBlue: 1,
    orange: [
        {
            id: 1,
            name: "Nigel Thornbrake",
            team: TeamColor.ORANGE,
            mvpr: 4.65,
        },
        {
            id: 2,
            name: "Shuckle",
            team: TeamColor.ORANGE,
            mvpr: 3.25,
        },
    ],
    blue: [
        {
            id: 3,
            name: "HyperCoder",
            team: TeamColor.BLUE,
            mvpr: 2.75,
        },
        {
            id: 4,
            name: "CodeRedJack",
            team: TeamColor.BLUE,
            mvpr: 1.65,
        },
    ],
};

export const TestPayload1 = {
    id: 1,
    numGames: 3,
    isScrim: true,
    gameMode: GameMode.DOUBLES,
    gameStats: [
        match1,
        match2,
        match3,
    ],
};
