export abstract class Item {
    abstract name: string;
    abstract id: ItemId;
    abstract description: string;
    abstract bonuses: ItemStatBonuses;
    abstract cost: number;
    abstract riotItemId: string;
}

export enum ItemId {
    BrambleVest,
    VampiricScepter,
    OblivionOrb,
    Tiamat,
    SerratedDirk,
    GiantsBelt,
    NegatronCloak,
    HextechAlternator,
    FiendishCodex,
}

export interface ItemStatBonuses {
    abilityPower?: number;
    attackDamage?: number;
    armor?: number;
    magicResist?: number;
    maxHP?: number;
    cdr?: number;
    critChance?: number;
    omnivamp?: number;
    lethality?: number;
}
