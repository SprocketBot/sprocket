import { z } from "zod";

export const MLERL_Leagues = [1, 2, 3, 4, 5];

export const RawFixtureSchema = z.array(z.tuple([
    z.string(), // Week number
    z.string(), // Home Name
    z.string(), // Away Name
    z.boolean(), // Is PL included
    z.string(), // Match period start datetime
    z.string(), // Match period end datetime
]).rest(z.string())
    .transform(([week, home, away, pl, start, end]) => ({
        week: parseInt(week),
        home: home,
        away: away,
        pl: pl,
        start: new Date(start),
        end: new Date(end),
    })));

export type RawFixture = z.infer<typeof RawFixtureSchema>;