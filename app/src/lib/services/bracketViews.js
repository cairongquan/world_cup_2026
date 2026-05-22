import { get } from 'svelte/store';
import { wcGroupTeams } from '../stores/tournament.js';
import { bracketGroups, bracketKnockout, bracketLoading } from '../stores/bracket.js';
import { fetchBracketSchedule, getBracketMatches, updateBracketViews } from './bracket.js';

export async function refreshBracketViews() {
  bracketLoading.set(true);
  try {
    if (!getBracketMatches().length) {
      await fetchBracketSchedule();
    }
    const views = updateBracketViews(get(wcGroupTeams));
    bracketGroups.set(views.groups);
    bracketKnockout.set(views.knockout);
  } catch (err) {
    console.warn('赛程数据加载失败', err);
    bracketGroups.set([]);
    bracketKnockout.set([]);
  } finally {
    bracketLoading.set(false);
  }
}
