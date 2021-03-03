import Unit from "./unit";
import UnitType from "./unit_type";

export class Minion extends Unit {
    constructor() {
        super({
            maxHP: 100,
            armor: 0,
            magicResistance: 0,
            abilityPower: 0,
            attackDamage: 30,
            attackRange: 1,
            ranged: false,
        });

        this.unitType = UnitType.Minion;
    }
}

export function createMinion() {
    return new Minion();
}