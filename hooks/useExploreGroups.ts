import { useEffect, useMemo } from 'react';
import { useCounterStore } from '../lib/store';
import { mergeExploreGroups } from '../lib/exploreSubfilters';
import type { ExploreGroup } from '../lib/categories';

/**
 * Explore taxonomy as users see it: the built-in groups plus any sub-filters
 * admins added from the dashboard.
 */
export function useExploreGroups(): ExploreGroup[] {
  const customSubfilters = useCounterStore((state) => state.customSubfilters);
  const fetchCustomSubfilters = useCounterStore((state) => state.fetchCustomSubfilters);

  useEffect(() => {
    fetchCustomSubfilters();
  }, [fetchCustomSubfilters]);

  return useMemo(() => mergeExploreGroups(customSubfilters), [customSubfilters]);
}
