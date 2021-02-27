export function randomItem<T>(items: T[] | string) {
    return items[Math.floor(Math.random() * items.length)];
}