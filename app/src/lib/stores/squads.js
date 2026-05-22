import { writable } from 'svelte/store';

/** @type {import('svelte/store').Writable<Record<string, object>|null>} */
export const squadsData = writable(null);
