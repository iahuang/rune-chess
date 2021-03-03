import { parse } from "path";
import Board from "../engine/board";
import BoardPosition from "../engine/board_position";
import Globals from "../engine/constants";
import Champion from "../engine/unit/champion/champion";
import { makeErrorEmbed } from "./embed";
import { ArgumentFormat, ArgumentType } from "./parser";
import { GameCommandCallInfo, RunechessBot } from "./runechess_discord";

export function interpretUnitTarget(arg: string, info: GameCommandCallInfo, alliedOnly = false) {
    /*
        When a game command takes a unit as an argument, the unit can either be specified
        by name or by location on the board. Returns a BoardPosition or an Error instance
    */

    arg = arg.toLowerCase();
    if (arg.match(/[a-z]\d/g)) {
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
    if (!arg.match(/[a-z]\d/g)) {
        throw new Error("Provided argument is not a coordinate");
    }
    let x = "abcdefghijklmop".indexOf(arg[0]);
    let y = Number.parseInt(arg[1])-1;

    let pos = new BoardPosition(x, y);

    if (!pos.inBounds) {
        throw new Error("Position is out of bounds");
    }
    return pos;
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

        if (!BoardPosition.withinSquare(target.pos, to, 1) || to.equals(target.pos)) {
            channel.send(makeErrorEmbed("You can only move one square at a time"));
            return;
        }
    } catch (err) {
        channel.send(makeErrorEmbed(err.message));
        return;
    }

    info.match.game.board.moveUnit(target, to);
}

export function registerGameCommands(bot: RunechessBot) {
    bot.registerGameCommand({
        name: "move",
        description: "Moves a piece to the specified square",
        format: new ArgumentFormat().add("piece", ArgumentType.String).add("to", ArgumentType.String),
        callback: (info) => {
            moveCommand(bot, info);
        },
    });
}
