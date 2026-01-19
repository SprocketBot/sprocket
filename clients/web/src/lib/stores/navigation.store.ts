import { writable } from 'svelte/store';

export const SCRIM_NAV_ITEM = { target: '/scrims', label: 'Play' };
export const LEAGUE_NAV_ITEM = { target: '/league', label: 'League Play' };
export const LFS_NAV_ITEM = { target: '/league/scrim', label: 'LFS Scrims' };
export const ADMIN_NAV_ITEM = { target: '/admin', label: 'Admin' };

export interface NavigationItem {
  label: string;
  target: string;
}

export const navigationStore = writable<NavigationItem[]>([
  SCRIM_NAV_ITEM,
  LEAGUE_NAV_ITEM,
  LFS_NAV_ITEM,
]);
