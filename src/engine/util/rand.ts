export function randomItem<T>(items: T[]) {
    return items[Math.floor(Math.random() * items.length)];
}

export function randomChar(string: string) {
    return randomItem(string as any);
}