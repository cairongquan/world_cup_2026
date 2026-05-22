import { writable } from 'svelte/store';

/** @type {import('svelte/store').Writable<Record<string, string[]>>} */
export const wcGroupTeams = writable({});

/** @type {import('svelte/store').Writable<any[]>} */
export const wcEvents = writable([]);

export const standingsUpdated = writable('');
export const liveUpdated = writable('');
export const liveCountLabel = writable('—');

/** @type {import('svelte/store').Writable<{letter:string,rows:any[]}[]>} */
export const standingsGroups = writable([]);

/** @type {import('svelte/store').Writable<any[]>} */
export const liveMatches = writable([]);
