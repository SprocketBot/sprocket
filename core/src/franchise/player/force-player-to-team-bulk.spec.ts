import { parseAndValidateCsv } from '../../util/csv-parse';
import { forcePlayerToTeamSchema } from './player.types';

describe('forcePlayerToTeamSchema', () => {
  it('parses CSV rows with mleid and newTeam', () => {
    const csv = ['mleid,newTeam', '12345,Pioneers', '67890, Sabres '].join('\n');
    const { data, errors } = parseAndValidateCsv(csv, forcePlayerToTeamSchema);

    expect(errors).toEqual([]);
    expect(data).toEqual([
      { mleid: 12345, newTeam: 'Pioneers' },
      { mleid: 67890, newTeam: 'Sabres' },
    ]);
  });

  it('rejects empty team names', () => {
    const csv = ['mleid,newTeam', '12345,'].join('\n');
    const { data, errors } = parseAndValidateCsv(csv, forcePlayerToTeamSchema);

    expect(data).toEqual([]);
    expect(errors).toHaveLength(1);
    expect(errors[0].row).toBe(2);
  });
});
