import { writable } from 'svelte/store';

/** @type {import('svelte/store').Writable<{ flyToVenue: (id: string) => void, exitStadiumView: () => void } | null>} */
export const mapControllerApi = writable(null);
