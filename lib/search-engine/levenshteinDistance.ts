
export const MAX_FUZZY_DISTANCE = 2;

/**
 * Computes the Levenshtein edit distance between two strings.
 * Uses the classic dynamic programming approach with O(min(a,b)) space.
 */
export function levenshteinDistance(a: string, b: string): number {
    if (a === b) return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    // Ensure 'a' is the shorter string for space optimization
    if (a.length > b.length) [a, b] = [b, a];

    let prevRow = Array.from({ length: a.length + 1 }, (_, i) => i);

    for (let j = 1; j <= b.length; j++) {
        const currRow = [j];
        for (let i = 1; i <= a.length; i++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            currRow[i] = Math.min(
                currRow[i - 1] + 1,      // insertion
                prevRow[i] + 1,           // deletion
                prevRow[i - 1] + cost     // substitution
            );
        }
        prevRow = currRow;
    }

    return prevRow[a.length];
}
