// Shared helpers for turning a report's branch selection into a human-readable
// label instead of a bare count like "1 Branch" / "3 Branches".

/**
 * Extract branch names from an array that may contain populated branch
 * objects ({ _id, name, code }) — e.g. Report.filters.branches as returned
 * by the reports list/detail endpoints, which populate name + code.
 */
export function namesFromBranchRefs(branchRefs = []) {
  return branchRefs
    .map((b) => (b && typeof b === 'object' && b.name) ? b.name : null)
    .filter(Boolean);
}

/**
 * Resolve a display label (and optional tooltip title for truncated lists)
 * for a report's branch scope.
 *
 * @param {boolean} allBranches
 * @param {string[]} names - resolved branch names, if known
 * @param {number} count - fallback count when names aren't available
 * @param {number} maxNames - how many names to show inline before truncating
 */
export function resolveBranchLabel({ allBranches, names = [], count = 0, maxNames = 3 }) {
  if (allBranches) return { label: 'All Branches', title: undefined };

  if (names.length > 0) {
    if (names.length <= maxNames) {
      return { label: names.join(', '), title: names.length > 1 ? names.join(', ') : undefined };
    }
    return { label: `${names[0]} +${names.length - 1} more`, title: names.join(', ') };
  }

  const n = Math.max(count, 1);
  return { label: `${n} Branch${n !== 1 ? 'es' : ''}`, title: undefined };
}
