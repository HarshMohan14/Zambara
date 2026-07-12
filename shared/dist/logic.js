export function calculateExtractionTarget(totalCivilians) {
    if (totalCivilians <= 0)
        return 0;
    if (totalCivilians >= 4) {
        return 3;
    }
    return Math.min(totalCivilians, Math.ceil(totalCivilians * 0.75));
}
