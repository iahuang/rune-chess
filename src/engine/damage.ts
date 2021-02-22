export enum DamageType {
    Physical,
    Magic,
    True
}

export function calculateDamageMultiplier(resistance: number) {
    if (resistance >= 0) {
        return 100/(100+resistance);
    } else {
        return 2 - (100/(100-resistance));
    }
}

export function calculateDamageTaken(amount: number, resistance: number) {
    return calculateDamageMultiplier(resistance) * amount;
}