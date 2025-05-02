import type { DataObject } from './DataObject';

export interface Role extends DataObject {
	roleCategory: string;
	gameAssociationID?: number;
	franchiseAssociationID?: number;
}
