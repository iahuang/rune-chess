import { CommandHandlerTable, RunechessBot } from "./runechess_discord";

import Discord from "discord.js";
import Match from "./match";
import Globals from "../engine/globals";
import { GameRenderer } from "../graphics/game_renderer";
import { TeamColor } from "../engine/team";
import Champion from "../engine/unit/champion/champion";
import DataDragon from "../riot/data_dragon";
import { AbilityIdentifier } from "../engine/unit/champion/ability/base_ability";
import { replaceAll } from "../engine/util/string";
import { LocationTargetedAbility } from "../engine/unit/champion/ability/location_target_ability";
import { UnitTargetedAbility } from "../engine/unit/champion/ability/unit_targeted_ability";
import { SelfTargetedAbility } from "../engine/unit/champion/ability/self_targeted_ability";

const EMBED_COLOR = "#ffd261";

function makeEmbedBase(title: string) {
    return new Discord.MessageEmbed()
        .setColor(EMBED_COLOR)
        .setTitle(title)
        .setAuthor(
            "Runechess",
            "https://github.com/iahuang/rune-chess/raw/main/assets/bard_icon.png",
            "https://github.com/iahuang/rune-chess"
        )
        .setFooter(`Game version ${Globals.gameVersion}`);
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

export function makeMatchListingEmbed(bot: RunechessBot, forGuildId: string) {
    let embed = makeEmbedBase("Ongoing Matches in this Server");

    let lines: string[] = [];

    for (let match of bot.ongoingMatches) {
        if (match.channel.guild.id === forGuildId) {
            lines.push(
                `#${match.channel.name} - ${match.playerRed.displayName} vs ${match.playerBlue.displayName} (id: ${match.id})`
            );
        }
    }

    if (lines.length === 0) {
        embed.setDescription("```No ongoing matches```");
    } else {
        embed.setDescription("```" + lines.join("\n") + "```");
    }
    return embed;
}

export function makeDebugInfoEmbed(message: string) {
    message = message || "<no output>";
    let embed = makeEmbedBase("Debug Command");
    if (message.length > 2000) {
        message = message.substring(0, 2000);
        message += "... (truncated)";
    }
    embed.setDescription("```" + message + "```");
    return embed;
}

export function makeChampionInfoEmbed(champion: Champion) {
    let embed = makeEmbedBase(`${champion.name}, ${champion.championTitle}`);

    embed.setThumbnail(new DataDragon().championSquareURL(champion.name));

    for (let id of [AbilityIdentifier.Q, AbilityIdentifier.W, AbilityIdentifier.E, AbilityIdentifier.R]) {
        let ability = champion.getAbilityByIdentifier(id);
        if (!ability) continue;

        let title = `${AbilityIdentifier[id]} - ${ability.name}`;
        let description = "Target Type: ";

        if (ability instanceof LocationTargetedAbility) {
            description+="*Location*";
        } else if (ability instanceof UnitTargetedAbility) {
            description+="*Unit*";
        } else if (ability instanceof SelfTargetedAbility) {
            description+="*Self*";
        } else {
            description+="*Other*";
        }
        description+="\n";

        description+=ability.description;

        for (let metricType of ability.getMetricTypes()) {
            let metricTextPlaceholder = `[${metricType}]`;

            let metric = ability.getMetric(metricType)!;
            let replacement = metric.baseAmount.toString();

            if (metric.adScaling) replacement += ` (+${Math.round(metric.adScaling * 100)}% AD)`;
            if (metric.apScaling) replacement += ` (+${Math.round(metric.apScaling * 100)}% AP)`;
            if (metric.casterMaxHPScaling) replacement += ` (+${Math.round(metric.casterMaxHPScaling * 100)}% max HP)`;
            if (metric.targetMaxHPScaling)
                replacement += ` (+${Math.round(metric.targetMaxHPScaling * 100)}% target max HP)`;

            description = replaceAll(description, metricTextPlaceholder, `**${replacement}**`);
        }

        embed.addField(title, description);
    }
    return embed;
}
