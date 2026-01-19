// TODO abstract to arbitrarily deep schedule groups, not just season -> week

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

export interface LeagueScheduleWeek {
  id: number;
  start: string;
  description: string;
  fixtures: LeagueScheduleFixture[];
}

export interface LeagueScheduleSeason {
  id: number;
  description: string;
  game: {
    id: number;
    title: string;
  };
  type: {
    name: string;
  };
  childGroups: LeagueScheduleWeek[];
}
