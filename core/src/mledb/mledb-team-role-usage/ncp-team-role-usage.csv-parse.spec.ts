import * as fs from 'fs';
import * as path from 'path';

import { parseAndValidateCsv } from '../../util/csv-parse';
import {
  collectNcpSlotValuesFromRow,
  ncpTeamRoleUsageCsvRowSchema,
} from './ncp-team-role-usage.csv-parse';

const FIXTURE = path.join(__dirname, '__fixtures__', 'ncp-slots-sheet-sample.csv');

describe('ncpTeamRoleUsageCsvRowSchema', () => {
  it('parses the sample sheet with split slot columns and sparse trailing cells', () => {
    const csv = fs.readFileSync(FIXTURE, 'utf8');
    const { data, errors } = parseAndValidateCsv(csv, ncpTeamRoleUsageCsvRowSchema);

    expect(errors).toEqual([]);
    expect(data).toHaveLength(6);

    expect(data[0]).toMatchObject({
      matchId: 68399,
      teamName: 'Sabres',
      leagueAbbrev: 'FL',
      slotsUsed: ['B', 'C', 'D', 'F'],
    });

    expect(data[1]).toMatchObject({
      matchId: 68535,
      teamName: 'Wizards',
      leagueAbbrev: 'FL',
      slotsUsed: ['B', 'D', 'E'],
    });

    expect(data[2]).toMatchObject({
      matchId: 68488,
      teamName: 'Express',
      leagueAbbrev: 'PL',
      slotsUsed: ['A', 'B'],
    });

    expect(data[4]).toMatchObject({
      matchId: 69050,
      teamName: 'Wizards',
      leagueAbbrev: 'CL',
      slotsUsed: ['G', 'H'],
    });

    expect(data[5]).toMatchObject({
      matchId: 68369,
      teamName: 'Bears',
      leagueAbbrev: 'PL',
      slotsUsed: ['A', 'B', 'C'],
    });
  });

  it('accepts camelCase headers with the same slot-column layout', () => {
    const csv = [
      'matchId,teamName,leagueAbbrev,Mode,slotsUsed,,',
      '1,Alpha,ML,3s,X,Y,',
    ].join('\n');
    const { data, errors } = parseAndValidateCsv(csv, ncpTeamRoleUsageCsvRowSchema);
    expect(errors).toEqual([]);
    expect(data[0]).toMatchObject({ matchId: 1, teamName: 'Alpha', leagueAbbrev: 'ML', slotsUsed: ['X', 'Y'] });
  });

  it('collectNcpSlotValuesFromRow ignores Mode and unknown columns', () => {
    expect(
      collectNcpSlotValuesFromRow({
        MatchID: 1,
        Team: 'T',
        League: 'FL',
        Mode: '3s',
        Slotsused: 'A',
        '': 'B',
        _1: 'C',
        stray: 'Z',
      }),
    ).toEqual(['A', 'B', 'C']);
  });
});
