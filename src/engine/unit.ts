interface UnitAttributes {
    maxHP: number;
    armor: number;
    magicResistance: number;
    attackDamage: number;
    abilityPower: number;
}

export default class Unit {
    baseAttributes: UnitAttributes;

    constructor(attributes: UnitAttributes) {
        this.baseAttributes = attributes;
    }
}
