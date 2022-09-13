export interface LeagueScheduleFranchise {
    title: string;
    primaryColor: string;
    secondaryColor: string;
    photo: {
        url: string;
    };
}

export interface LeagueScheduleFixture {
    id: number;
    homeFranchise: {
        profile: LeagueScheduleFranchise;
    };
    awayFranchise: {
        profile: LeagueScheduleFranchise;
    };
}

export interface LeagueScheduleValue {
    schedule: {
        id: number;
        description: string;
        game: {
            id: number;
            title: string;
        };
        type: {
            name: string;
        };
        childGroups: Array<{
            id: number;
            start: Date;
            description: string;
            fixtures: LeagueScheduleFixture[];
        }>;
    };
}
