import { CommandHandlerTable, GameCommandHandlerTable, RunechessBot } from "./runechess_discord";

import Discord from "discord.js";
import { Match } from "./match";
import Globals from "../engine/globals";
import { GameRenderer } from "../graphics/game_renderer";
import { TeamColor } from "../engine/team";
import Champion from "../engine/unit/champion/champion";
import DataDragon from "../riot/data_dragon";
import { AbilityIdentifier, BaseAbility, TargetType } from "../engine/unit/champion/ability/base_ability";
import { replaceAll } from "../util/string";
import { LocationTargetedAbility } from "../engine/unit/champion/ability/location_target_ability";

export interface EmbedGeneratorParams {
    embedColor: string;
    dataDragon: DataDragon;
}

export class EmbedGenerator {
    embedColor: string;
    dataDragon: DataDragon;
    constructor(params: EmbedGeneratorParams) {
        this.embedColor = params.embedColor;
        this.dataDragon = params.dataDragon;
    }
    makeEmbedBase(title: string) {
        return new Discord.MessageEmbed()
            .setColor(this.embedColor)
            .setTitle(title)
            .setAuthor(
                "Runechess",
                "https://github.com/iahuang/rune-chess/raw/main/assets/bard_icon.png",
                "https://github.com/iahuang/rune-chess"
            )
            .setFooter(`Game version ${Globals.gameVersion}`);
    }
    makeHelpEmbed(prefix: string, commandTable: CommandHandlerTable, gameCommandTable: GameCommandHandlerTable) {
        let embed = this.makeEmbedBase("Command Help");

        for (let commandName of Object.keys(commandTable)) {
            let handler = commandTable[commandName];
            let commandSummary = prefix + commandName;
            if (handler.format._args.length === 0) {
                commandSummary += " (no arguments)";
            }
            for (let arg of handler.format._args) {
                commandSummary += ` [${arg.name}]`;
                if (arg.optional) {
                    commandSummary += "?";
                }
            }

            embed.addField(commandSummary, handler.description);
        }

        for (let [commandName, handler] of Object.entries(gameCommandTable)) {
            let title = prefix + commandName;
            for (let arg of handler.format._args) {
                title += ` [${arg.name}]`;
                if (arg.optional) title += "?";
            }
            let desc = handler.description;
            if (handler.aliases.length) desc += "\naliases: " + handler.aliases.join(", ");
            desc += "\n*This command can only be run while in game*";
            embed.addField(title, desc);
        }

        return embed;
    }

    makeErrorEmbed(errorMessage: string, helpString: string = "") {
        let embed = this.makeEmbedBase("Command Error");
        return embed.setDescription(`> ${errorMessage}\n${helpString}`);
    }

    makeMatchStartEmbed(match: Match) {
        let embed = this.makeEmbedBase("Match Start");
        embed.addField("Red Team", match.playerRed.displayName);
        embed.addField("Blue Team", match.playerBlue.displayName);
        return embed;
    }

    makeGameViewEmbed(renderer: GameRenderer, match: Match) {
        let embed = this.makeEmbedBase(`Game - ${TeamColor[match.game.turn]} to move`);
        renderer.render(match.game);
        let attachment = new Discord.MessageAttachment(renderer.getCanvasBuffer(), "canvas.png");
        embed.attachFiles([attachment]).setImage("attachment://canvas.png");
        return embed;
    }

    makeMatchListingEmbed(bot: RunechessBot, forGuildId: string) {
        let embed = this.makeEmbedBase("Ongoing Matches in this Server");

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

    makeDebugInfoEmbed(message: string) {
        message = message || "<no output>";
        let embed = this.makeEmbedBase("Debug Command");
        if (message.length > 2000) {
            message = message.substring(0, 2000);
            message += "... (truncated)";
        }
        embed.setDescription("```" + message + "```");
        return embed;
    }

    replaceDescriptionPlaceholders(description: string, ability: BaseAbility) {
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
        return description;
    }

    makeChampionInfoEmbed(champion: Champion) {
        let embed = this.makeEmbedBase(`${champion.displayName}, ${champion.championTitle}`);

        embed.setDescription(`*"${champion.displayedQuote}"*`);
        embed.setThumbnail(this.dataDragon.championSquareURL(champion.getRiotName()));

        let passive = champion.getAbilityByIdentifier(AbilityIdentifier.P);
        if (passive) {
            let title = `Passive - ${passive.name}`;
            let description = this.replaceDescriptionPlaceholders(passive.description, passive);
            embed.addField(title, description);
        }

        for (let id of [AbilityIdentifier.Q, AbilityIdentifier.W, AbilityIdentifier.E, AbilityIdentifier.R]) {
            let ability = champion.getAbilityByIdentifier(id);
            if (!ability) continue;

            /* Create ability text */

            let title = `${AbilityIdentifier[id]} - ${ability.name}`;
            let description = "Target Type: ";

            if (ability.targetType === TargetType.Location) {
                description += "*Location*";
            } else if (ability.targetType === TargetType.Unit) {
                description += "*Unit*";
            } else if (ability.targetType === TargetType.Self) {
                description += "*Self*";
            } else {
                description += "*Other*";
            }
            description += "\n";

            let range = (ability as LocationTargetedAbility).maxRange;
            if (typeof range === "number")
                description += `Range: ${range} squares ([Manhattan distance](https://en.wikipedia.org/wiki/Taxicab_geometry))\n`;

            description += this.replaceDescriptionPlaceholders(ability.description, ability);

            embed.addField(title, description);
        }
        return embed;
    }

    makeChampionRegistryEmbed(prefix: string) {
        let registry = Globals.championRegistry;
        let embed = this.makeEmbedBase("Champions List");
        let description = "";

        for (let c of registry.allChampionNames().sort()) {
            let champion = registry.instantiateChampion(c);
            description += `- ${champion.displayName}, ${champion.championTitle}`;
            description += "\n";
        }
        description += `Use ${prefix}info [champion] to learn more about a specific champion.`;
        embed.setDescription(description);
        return embed;
    }
}
