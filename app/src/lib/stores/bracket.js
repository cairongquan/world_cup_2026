import { writable } from 'svelte/store';

/** @type {import('svelte/store').Writable<{ letter: string, label: string, teams: { main: string }[] }[]>} */
export const bracketGroups = writable([]);

/** @type {import('svelte/store').Writable<{ key: string, label: string, matches: object[] }[]>} */
export const bracketKnockout = writable([]);

export const bracketLoading = writable(false);
