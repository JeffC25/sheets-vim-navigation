// Patterns are globs over the full URL: `*` matches any run of characters, everything else is
// literal. e.g. `*://docs.google.com/spreadsheets*`.
export function urlMatches(url: string, patterns: string[]): boolean {
    return patterns.some((pattern) => {
        const regex = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
        return new RegExp(`^${regex}$`).test(url);
    });
}
