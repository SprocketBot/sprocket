import type { DataObject } from './DataObject';
import type { Role } from './Role';

export interface Player extends DataObject {
	roles?: Role[];
	league: DataObject;
	salary: number;
	playing?: boolean;
}
