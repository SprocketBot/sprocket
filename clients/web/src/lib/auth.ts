import type { User } from '@sprocketbot/lib/types';
import { getContext, setContext } from 'svelte';

// Use a symbol here to prevent any conflicts
const UserContext = Symbol('SprocketUserContext');
export const setUserContext = (v: User) => setContext(UserContext, v);
export const getUserContext = (): User => getContext(UserContext);

export const can = (target: string, u?: User) => {
	const user = u ?? getUserContext();

	return true;
};
