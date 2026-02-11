export function shuffle<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

export function pickN<T>(array: T[], n: number): T[] {
    const shuffled = shuffle(array);
    return shuffled.slice(0, Math.min(n, array.length));
}
