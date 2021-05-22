import { parse } from "path";
import Board from "../../engine/board";
import BoardPosition from "../../engine/board_position";
import Globals from "../../engine/globals";
import AbilityTarget from "../../engine/unit/champion/ability/ability_target";
import { AbilityCastError, AbilityIdentifier, TargetType } from "../../engine/unit/champion/ability/base_ability";
import Champion from "../../engine/unit/champion/champion";
import { ArgumentFormat, ArgumentType } from "../parser";
import { CommandError, GameCommandCallInfo, RunechessBot } from "../bot";

export function parseUnitTargetArg(arg: string, info: GameCommandCallInfo, alliedOnly = false) {
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
                if (alliedOnly && info.teamColor !== unit.teamColor) {
                    continue;
                }

                let champion = unit as Champion;
                if (champion.name.toLowerCase() === arg || champion.nicknames.includes(arg)) {
                    if (queriedChamp) {
                        throw new CommandError("There are multiple units on the board with this name");
                    }

                    queriedChamp = champion;
                }
            }
        }

        if (queriedChamp === null) {
            throw new CommandError("The specified unit was not found");
        }

        return queriedChamp;
    }
}

export function parseAsCoordinate(arg: string) {
    if (!isCoordinate(arg)) {
        throw new CommandError("Provided argument is not a coordinate");
    }
    let x = "abcdefghijklmop".indexOf(arg[0]);
    let y = Number.parseInt(arg[1]) - 1;

    let pos = new BoardPosition(x, y);

    if (!pos.inBounds) {
        throw new CommandError("Position is out of bounds");
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

    target = parseUnitTargetArg(info.parsedArgs[0], info, true);
    to = parseAsCoordinate(info.parsedArgs[1]);

    if (info.match.game.board.getUnitAt(to) !== null) {
        bot.throwCommandError("There is already a unit where you are trying to move");
    }

    if (info.teamColor !== target.teamColor) {
        bot.throwCommandError("You can only move allied units");
    }

    if (!BoardPosition.withinSquare(target.pos, to, 1) || to.equals(target.pos)) {
        bot.throwCommandError("You can only move one square at a time");
    }

    //console.log("Moving unit at",target.pos,"to",to);

    info.match.game.board.moveUnit(target, to);
}

export function castCommand(bot: RunechessBot, info: GameCommandCallInfo) {
    let channel = info.command.message.channel;

    // Make sure that the target is a champion
    let caster = parseUnitTargetArg(info.parsedArgs[0], info, true) as Champion;
    if (!caster.isChampion) throw new Error("Only champions can cast abilities");

    // Obtain an Ability Identifier enum type from
    // the user input
    let queriedAbility: string = info.parsedArgs[1].toLowerCase();
    let abilityIdentifier = (
        {
            q: AbilityIdentifier.Q,
            w: AbilityIdentifier.W,
            e: AbilityIdentifier.E,
            r: AbilityIdentifier.R,
        } as { [k: string]: AbilityIdentifier }
    )[queriedAbility];

    if (abilityIdentifier === undefined) {
        throw new CommandError(`Invalid ability identifier "${queriedAbility}"`);
    }

    // Obtain the corresponding ability object (make sure it exists)
    let ability = caster.getAbilityByIdentifier(abilityIdentifier);
    if (!ability)
        throw new CommandError(
            `${caster.name} does not have a ${
                AbilityIdentifier[abilityIdentifier]
            } ability. For a list of abilities on this champion, use \`.info ${caster.name.toLowerCase()}\``
        );

    // Create an AbilityTarget object based on the user input
    let target = AbilityTarget.noTarget(); // default to "no target"
    let targetArg: string | null = info.parsedArgs[2];
    if (targetArg) {
        // if a target argument is provided, try to parse it based on the type of ability target required
        if (ability.targetType === TargetType.Location) {
            target = AbilityTarget.atLocation(parseAsCoordinate(targetArg));
        }
        if (ability.targetType === TargetType.Unit) {
            target = AbilityTarget.atUnit(parseUnitTargetArg(targetArg, info));
        }
    }

    try {
        caster.castAbility(abilityIdentifier, target);
    } catch (err) {
        if (err instanceof AbilityCastError) {
            bot.throwCommandError(err.reason);
        }
        throw err;
    }
}

export function tpCommand(bot: RunechessBot, info: GameCommandCallInfo) {
    try {
        let target = parseUnitTargetArg(info.parsedArgs[0], info);
        let to = parseAsCoordinate(info.parsedArgs[1]);

        target.moveTo(to);
    } catch (err) {
        bot.throwCommandError(err.message);
    }
}

export function registerGameCommands(bot: RunechessBot) {
    /* Move command */
    bot.registerGameCommand({
        name: "move",
        aliases: ["m", "mv", "mov"],
        description: "Moves a piece to the specified square",
        format: new ArgumentFormat().add("piece", ArgumentType.String).add("to", ArgumentType.String),
        callback: (info) => {
            // ensure that the casting team has available action points
            let team = info.match.game.getTeamWithColor(info.teamColor);

            if (team.actionPointsRemaining === 0) {
                bot.throwCommandError("You have no remaining action points!");
            }
            moveCommand(bot, info);
            info.command.message.channel.send(bot.embeds.makeGameViewEmbed(bot.gameRenderer, info.match));
        },
    });

    /* Cast command */
    bot.registerGameCommand({
        name: "cast",
        aliases: ["c"],
        description: "Casts an ability",
        format: new ArgumentFormat()
            .add("champion", ArgumentType.String)
            .add("ability", ArgumentType.String)
            .addOptional("target", ArgumentType.String),
        callback: (info) => {
            // ensure that the casting team has available action points
            let team = info.match.game.getTeamWithColor(info.teamColor);

            if (team.actionPointsRemaining === 0) {
                bot.throwCommandError("You have no remaining action points!");
            }
            castCommand(bot, info);
        },
    });

    /* End turn command */
    bot.registerGameCommand({
        name: "end",
        aliases: ["endturn", "et"],
        description: "Ends your turn",
        format: ArgumentFormat.none(),
        callback: (info) => {
            // We don't need to ensure that it is actually
            // the turn of whoever is calling this command
            // as the GameCommand handler takes care of that already

            let apr = info.match.game.getTeamWithColor(info.teamColor).actionPointsRemaining;

            // warn the user if they still have action points left
            if (apr > 0) {
                let playerState = info.match.getPlayerStateWithColor(info.teamColor);

                if (!playerState.hasGottenEarlyTurnEndWarning) {
                    let message =
                        `You have not spent all your action points! (${apr} remaining)\n` +
                        `To end your turn early, run ${bot.inlineCommandName("end")} again.`;
                    info.command.message.channel.send(message);

                    playerState.hasGottenEarlyTurnEndWarning = true;
                    return;
                } else {
                    // reset flag
                    playerState.hasGottenEarlyTurnEndWarning = false;
                }
            }

            info.match.game.endCurrentTurn();
            info.command.message.channel.send(bot.embeds.makeGameViewEmbed(bot.gameRenderer, info.match));
        },
    });

    // debug only
    if (bot.config.debug) {
        bot.registerGameCommand({
            name: "tp",
            description: "Teleports a unit to the given location (debug only)",
            format: new ArgumentFormat().add("unit", ArgumentType.String).add("to", ArgumentType.String),
            callback: (info) => {
                tpCommand(bot, info);
                info.command.message.channel.send(bot.embeds.makeGameViewEmbed(bot.gameRenderer, info.match));
            },
        });
    }
}
