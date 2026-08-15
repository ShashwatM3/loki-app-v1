import { EXPLORE_GROUPS, type ExploreGroup } from './categories';

/**
 * Admin-defined Explore sub-filters, stored in Firestore at
 * `config/exploreSubfilters` — identical shape to the website.
 */
export type CustomSubfilter = {
  id: string;
  /** Explore group this sub-filter belongs to (a group id, or a new group's id). */
  groupId: string;
  /** Label shown on the pill. */
  label: string;
  emoji: string;
  /** Keywords matched against a place's name, category, tags, vibes, description. */
  keywords: string[];
  /** Set when the admin created a brand-new group alongside the sub-filter. */
  groupLabel?: string;
  groupEmoji?: string;
};

export const EXPLORE_SUBFILTERS_DOC = { collection: 'config', id: 'exploreSubfilters' } as const;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Default keywords for a sub-filter whose admin left the keyword field empty. */
export function defaultKeywords(label: string): string[] {
  const trimmed = label.trim().toLowerCase();
  return trimmed ? [trimmed] : [];
}

/**
 * Merge the built-in Explore taxonomy with admin-added sub-filters.
 */
export function mergeExploreGroups(custom: CustomSubfilter[]): ExploreGroup[] {
  const groups: ExploreGroup[] = EXPLORE_GROUPS.map((g) => ({
    ...g,
    subfilters: [...g.subfilters],
  }));

  for (const item of custom) {
    if (!item.label?.trim()) continue;
    let group = groups.find((g) => g.id === item.groupId);
    if (!group) {
      group = {
        id: item.groupId,
        label: item.groupLabel?.trim() || item.groupId,
        emoji: item.groupEmoji || '\u2728',
        subfilters: [],
      };
      groups.push(group);
    }
    const exists = group.subfilters.some(
      (sf) => sf.label.toLowerCase() === item.label.toLowerCase()
    );
    if (exists) continue;
    group.subfilters.push({
      label: item.label,
      emoji: item.emoji || '\u2728',
      keywords: item.keywords?.length ? item.keywords : defaultKeywords(item.label),
    });
  }

  return groups;
}
