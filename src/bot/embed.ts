import { CommandHandlerTable } from "./runechess_discord";

import Discord from "discord.js";
import Match from "./match";
import Globals from "../engine/constants";
import { GameRenderer } from "../graphics/game_renderer";
import { TeamColor } from "../engine/team";

const EMBED_COLOR = "#ffd261";

function makeEmbedBase(title: string) {
    return new Discord.MessageEmbed()
        .setColor(EMBED_COLOR)
        .setTitle(title)
        .setAuthor(
            "Runechess",
            "https://github.com/iahuang/rune-chess/raw/main/assets/bard_icon.png",
            "https://github.com/iahuang/rune-chess"
        ).setFooter(`Game version ${Globals.gameVersion}`);
}

export function makeHelpEmbed(commandTable: CommandHandlerTable) {
    let embed = makeEmbedBase("Command Help");

    for (let commandName of Object.keys(commandTable)) {
        let handler = commandTable[commandName];
        let commandSummary = commandName;
        if (handler.format._args.length === 0) {
            commandSummary += " (no arguments)";
        }
        for (let arg of handler.format._args) {
            commandSummary += ` [${arg.name}]`;
            if (arg.optional) {
                commandSummary += "?";
            }
        }

        embed.addField(commandSummary, handler.description, true);
    }
    return embed;
}

export function makeErrorEmbed(errorMessage: string) {
    let embed = makeEmbedBase("Command Error");
    return embed.setDescription(`> ${errorMessage}\nUse the help command for more information`);
}

export function makeMatchStartEmbed(match: Match) {
    let embed = makeEmbedBase("Match Start");
    embed.addField("Red Team", match.playerRed.displayName);
    embed.addField("Blue Team", match.playerBlue.displayName);
    return embed;
}

export function makeGameViewEmbed(renderer: GameRenderer, match: Match) {
    let embed = makeEmbedBase(`Game - ${TeamColor[match.game.turn]} to move`);
    renderer.render(match.game);
    let attachment = new Discord.MessageAttachment(renderer.getCanvasBuffer(), "canvas.png");
    embed.attachFiles([attachment]).setImage("attachment://canvas.png");
    return embed;
}