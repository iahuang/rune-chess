import { parse } from "path";
import Board from "../engine/board";
import BoardPosition from "../engine/board_position";
import Globals from "../engine/globals";
import AbilityTarget from "../engine/unit/champion/ability/ability_target";
import { AbilityIdentifier, TargetType } from "../engine/unit/champion/ability/base_ability";
import Champion from "../engine/unit/champion/champion";
import { makeErrorEmbed, makeGameViewEmbed } from "./embed";
import { ArgumentFormat, ArgumentType } from "./parser";
import { GameCommandCallInfo, RunechessBot } from "./runechess_discord";

export function interpretUnitTarget(arg: string, info: GameCommandCallInfo, alliedOnly = false) {
    /*
        When a game command takes a unit as an argument, the unit can either be specified
        by name or by location on the board. Returns a BoardPosition or an Error instance
    */

    arg = arg.toLowerCase();
    if (isCoordinate(arg)) {
        // interpret argument as a coordinate like "A1"
        let pos = parseAsCoordinate(arg);

        let unit = info.match.game.board.getUnitAt(pos);

        if (!unit) {
            throw new Error("There is no unit here");
        }

        return unit;
    } else {
        let queriedChamp: Champion | null = null;

        for (let unit of info.match.game.board.allUnits()) {
            if (unit.isChampion) {
                if (alliedOnly && info.team !== unit.teamColor) {
                    continue;
                }

                let champion = unit as Champion;
                if (champion.name.toLowerCase() === arg || champion.nicknames.includes(arg)) {
                    if (queriedChamp) {
                        throw new Error("There are multiple units on the board with this name");
                    }

                    queriedChamp = champion;
                }
            }
        }

        if (queriedChamp === null) {
            throw new Error("The specified unit was not found");
        }

        return queriedChamp;
    }
}

export function parseAsCoordinate(arg: string) {
    if (!isCoordinate(arg)) {
        throw new Error("Provided argument is not a coordinate");
    }
    let x = "abcdefghijklmop".indexOf(arg[0]);
    let y = Number.parseInt(arg[1]) - 1;

    let pos = new BoardPosition(x, y);

    if (!pos.inBounds) {
        throw new Error("Position is out of bounds");
    }
    return pos;
}

export function isCoordinate(arg: string) {
    return Boolean(arg.match(/[a-z]\d/g));
}

export function moveCommand(bot: RunechessBot, info: GameCommandCallInfo) {
    let channel = info.command.message.channel;
    let target;
    let to;

    try {
        target = interpretUnitTarget(info.parsedArgs[0], info, true);
        to = parseAsCoordinate(info.parsedArgs[1]);

        if (info.match.game.board.getUnitAt(to) !== null) {
            channel.send(makeErrorEmbed("There is already a unit where you are trying to move"));
            return;
        }

        if (info.team !== target.teamColor) {
            channel.send(makeErrorEmbed("You can only move allied units"));
            return;
        }

        if (!BoardPosition.withinSquare(target.pos, to, 1) || to.equals(target.pos)) {
            channel.send(makeErrorEmbed("You can only move one square at a time"));
            return;
        }

        //console.log("Moving unit at",target.pos,"to",to);
    } catch (err) {
        channel.send(makeErrorEmbed(err.message));
        return;
    }

    info.match.game.board.moveUnit(target, to);
}

export function castCommand(bot: RunechessBot, info: GameCommandCallInfo) {
    let channel = info.command.message.channel;

    try {
        let caster = interpretUnitTarget(info.parsedArgs[0], info, true) as Champion;
        if (!caster.isChampion) throw new Error("Only champions can cast abilities");
        let queriedAbility: string = info.parsedArgs[1].toLowerCase();
        let abilityIdentifier = ({
            q: AbilityIdentifier.Q,
            w: AbilityIdentifier.W,
            e: AbilityIdentifier.E,
            r: AbilityIdentifier.R,
        } as { [k: string]: AbilityIdentifier })[queriedAbility];

        if (abilityIdentifier === undefined) {
            throw new Error(`Invalid ability identifier "${queriedAbility}"`);
        }

        let ability = caster.getAbilityByIdentifier(abilityIdentifier);
        if (!ability)
            throw new Error(
                `${caster.name} does not have a ${
                    AbilityIdentifier[abilityIdentifier]
                } ability. For a list of abilities on this champion, use \`.info ${caster.name.toLowerCase()}\``
            );
        let target = AbilityTarget.noTarget();
        let targetArg: string | null = info.parsedArgs[2];
        if (targetArg) {
            if (ability.targetType === TargetType.Location) {
                target = AbilityTarget.atLocation(parseAsCoordinate(targetArg));
            }
            if (ability.targetType === TargetType.Unit) {
                target = AbilityTarget.atUnit(interpretUnitTarget(targetArg, info));
            }
        }

        caster.castAbility(abilityIdentifier, target);
    } catch (err) {
        channel.send(makeErrorEmbed(err.message));
        return;
    }
}

export function registerGameCommands(bot: RunechessBot) {
    bot.registerGameCommand({
        name: "move",
        aliases: ["m", "mv", "mov"],
        description: "Moves a piece to the specified square",
        format: new ArgumentFormat().add("piece", ArgumentType.String).add("to", ArgumentType.String),
        callback: (info) => {
            moveCommand(bot, info);
            info.command.message.channel.send(makeGameViewEmbed(bot.gameRenderer, info.match));
        },
    });

    bot.registerGameCommand({
        name: "cast",
        aliases: ["c"],
        description: "Casts an ability",
        format: new ArgumentFormat()
            .add("champion", ArgumentType.String)
            .add("ability", ArgumentType.String)
            .addOptional("target", ArgumentType.String),
        callback: (info) => {
            castCommand(bot, info);
        },
    });
}
