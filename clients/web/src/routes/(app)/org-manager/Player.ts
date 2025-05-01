import type { League } from './League';
import type { Role } from './Role';

export interface Player {
	name: string;
	roles?: Role[];
	league: League;
	salary: number;
	playing?: boolean;
}
