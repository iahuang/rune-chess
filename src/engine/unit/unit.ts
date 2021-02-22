import Board from "../board";
import BoardPosition from "../board_position";
import { calculateDamageTaken, DamageType } from "../damage";
import UnitAttributes from "./unit_attributes";

export default class Unit {
    baseAttributes: UnitAttributes;
    hp: number;
    isChampion = false;
    _board?: Board;
    pos: BoardPosition;
    name: string;

    constructor(attributes: UnitAttributes) {
        this.baseAttributes = attributes;
        this.hp = this.baseAttributes.maxHP;
        this.pos = new BoardPosition(0, 0);
        this.name = "unit";
    }

    get board() {
        if (!this._board) {
            throw new Error("Unit has not been placed on a board yet");
        }
        return this._board;
    }

    private _takeDamage(rawDamage: number) {
        this.hp -= rawDamage;
    }

    calculateArmor() {
        return this.baseAttributes.armor;
    }

    calculateMagicResist() {
        return this.baseAttributes.magicResistance;
    }

    calculateMaxHP() {
        return this.baseAttributes.maxHP;
    }

    takeDamage(amount: number, source: Unit, type: DamageType) {
        if (type === DamageType.Physical) {
            this._takeDamage(calculateDamageTaken(amount, this.calculateArmor()));
        }
    }

    percentageOfMaxHP(percent: number) {
        return percent*this.calculateMaxHP();
    }
}