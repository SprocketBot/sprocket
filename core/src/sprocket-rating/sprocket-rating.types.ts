export interface SprocketRatingInput {
  goals: number;
  assists: number;
  shots: number;
  saves: number;
  goals_against: number;
  shots_against: number;
  team_size?: number;
}

export interface SprocketRating {
  opi: number;
  dpi: number;
  gpi: number;
}
