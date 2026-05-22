import { writable } from 'svelte/store';

export const panelRightHidden = writable(typeof window !== 'undefined' && window.innerWidth <= 768);
export const panelLeftHidden = writable(typeof window !== 'undefined' && window.innerWidth <= 768);
export const stadiumBackVisible = writable(false);
export const activeVenueId = writable(null);
/** @type {import('svelte/store').Writable<string|null>} */
export const squadModalTeam = writable(null);
/** 飞入 3D 场馆时的全屏 loading */
export const globalMapLoading = writable(false);
/** 赛程阶梯图弹窗 */
export const bracketModalOpen = writable(false);
