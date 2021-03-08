import Board from "../board";
import BoardPosition from "../board_position";
import { calculateDamageMultiplier, calculateDamageTaken, DamageType } from "../damage";
import { Item, ItemStatBonuses } from "../item";
import { StatusEffect } from "../status_effect";
import EffectGrievousWounds from "../status_effects/grevious_wounds";
import { Team, TeamColor } from "../team";
import UnitAttributes from "./unit_attributes";
import UnitType from "./unit_type";

export default class Unit {
    baseAttributes: UnitAttributes;
    hp: number;
    unitType: UnitType;
    private _board?: Board;
    pos: BoardPosition;
    name: string;
    teamColor: TeamColor;

    statusEffects: StatusEffect[];

    items: Item[];

    constructor(attributes: UnitAttributes) {
        this.baseAttributes = attributes;
        this.hp = this.baseAttributes.maxHP;
        this.pos = new BoardPosition(0, 0);
        this.name = "unit";
        this.teamColor = TeamColor.Neutral;
        this.statusEffects = [];
        this.unitType = UnitType.Other;
        this.items = [];
    }

    giveItem(ItemConstructor: new () => Item) {
        this.items.push(new ItemConstructor());
    }

    applyStatusEffect(E: new (source: Unit, user: Unit, duration: number) => StatusEffect, duration: number) {
        let effect = new E(this, this, duration);
        this.statusEffects.push(effect);
        effect.refreshEffect();
        effect.onApply();
    }

    hasStatusEffect(E: typeof StatusEffect) {
        // Checks to see whether a status effect is present on this unit,
        // returning its instance if so.
        for (let effect of this.statusEffects) {
            if (effect.constructor === E) {
                return effect;
            }
        }
        return null;
    }

    getTeam() {
        return this.getGameInstance().getTeamWithColor(this.teamColor);
    }

    get board() {
        if (!this._board) {
            throw new Error("Unit has not been placed on a board yet");
        }
        return this._board;
    }

    getGameInstance() {
        return this.board.gameInstance;
    }

    private _takeDamage(rawDamage: number) {
        this.hp -= rawDamage;
    }

    private _itemBonuses(accessor: (bonus: ItemStatBonuses) => number | undefined) {
        let bonus = 0;

        for (let item of this.items) {
            bonus += accessor(item.bonuses) || 0;
        }

        return bonus;
    }

    calculateArmor() {
        return this.baseAttributes.armor + this._itemBonuses((b) => b.armor);
    }

    calculateMagicResist() {
        return this.baseAttributes.magicResistance + this._itemBonuses((b) => b.magicResist);
    }

    calculateMaxHP() {
        return this.baseAttributes.maxHP + this._itemBonuses((b) => b.maxHP);
    }

    calculateLethality() {
        return this._itemBonuses((b) => b.lethality);
    }

    calculateAD() {
        return this.baseAttributes.attackDamage + this._itemBonuses((b) => b.attackDamage);
    }

    calculateAP() {
        return this.baseAttributes.abilityPower + this._itemBonuses((b) => b.abilityPower);
    }

    calculateCritChance() {
        return this._itemBonuses((b) => b.critChance);
    }

    calculateOmnivamp() {
        return this._itemBonuses((b) => b.omnivamp);
    }

    takeDamage(amount: number, source: Unit, type: DamageType) {
        let damageAmount = amount;
        if (type === DamageType.Physical) {
            damageAmount *= calculateDamageMultiplier(this.calculateArmor() - source.calculateLethality());
        } else if (type === DamageType.Magic) {
            damageAmount *= calculateDamageMultiplier(this.calculateMagicResist());
        }
        this._takeDamage(damageAmount);
    }

    heal(amount: number, source?: Unit) {
        let healingReduction = 1;
        let grievous = this.hasStatusEffect(EffectGrievousWounds);
        if (grievous) {
            healingReduction = (grievous as EffectGrievousWounds).healingReduction;
        }

        this.hp += amount * healingReduction;

        this.hp = Math.min(this.hp, this.calculateMaxHP());
    }

    percentageOfMaxHP(percent: number) {
        return percent * this.calculateMaxHP();
    }

    dealDamage(amount: number, to: Unit, type: DamageType) {
        to.takeDamage(amount, this, type);
    }

    linkBoard(board: Board) {
        this._board = board;
    }

    unlinkBoard() {
        this._board = undefined;
    }

    get isChampion() {
        return this.unitType === UnitType.Champion;
    }

    alliedTo(unit: Unit) {
        return unit.teamColor === this.teamColor;
    }

    onActiveTurnEnd() {}
    onInactiveTurnEnd() {}

    _onTurnEnd(activeTurn: boolean) {
        for (let effect of this.statusEffects) {
            effect._onTurnEnd(activeTurn);

            if (effect.shouldExpire) {
                effect.onExpire();
            }
        }

        this.statusEffects = this.statusEffects.filter((effect) => !effect.shouldExpire);

        if (activeTurn) {
            this.onActiveTurnEnd();
        } else {
            this.onInactiveTurnEnd();
        }
    }
}
