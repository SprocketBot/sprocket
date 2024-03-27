// import { AuthAction, type AuthTarget, type User } from '@sprocketbot/lib/types';
import type { AuthTarget, User } from '@sprocketbot/lib/types';
import { getContext, setContext } from 'svelte';
// Use a symbol here to prevent any conflicts
const UserContext = Symbol('SprocketUserContext');
export const setUserContext = (v: User) => setContext(UserContext, v);
export const getUserContext = (): User => getContext(UserContext);

export const canView = (target: AuthTarget, u?: User) => {
	const user = u ?? getUserContext();
	
	return true;
};

