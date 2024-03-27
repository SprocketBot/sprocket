import { AuthPlatform } from '@sprocketbot/lib/types';
import { Discord, Steam } from '@steeze-ui/simple-icons';
import type { IconSource } from '@steeze-ui/svelte-icon';

export const platformIconMap: Record<AuthPlatform, IconSource> = {
	[AuthPlatform.DISCORD]: Discord,
	[AuthPlatform.STEAM]: Steam
};
