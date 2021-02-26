import Board from "../board";
import BoardPosition from "../board_position";
import { calculateDamageTaken, DamageType } from "../damage";
import { StatusEffect } from "../status_effect";
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

    constructor(attributes: UnitAttributes) {
        this.baseAttributes = attributes;
        this.hp = this.baseAttributes.maxHP;
        this.pos = new BoardPosition(0, 0);
        this.name = "unit";
        this.teamColor = TeamColor.Neutral;
        this.statusEffects = [];
        this.unitType = UnitType.Other;
    }

    applyStatusEffect(Effect: any, to: Unit) {
        let effect = Effect(this, to);
        to.statusEffects.push(effect);
        effect.refreshEffect();
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
}