import { ParsedCommand } from "../parser";
import Discord from "discord.js";
import { RunechessBot } from "../runechess_discord";
import { TeamColor } from "../../engine/team";

export function startMatchCommand(bot: RunechessBot, args: any[], command: ParsedCommand) {
    let channel = command.message.channel;

    if (!(channel instanceof Discord.TextChannel)) {
        channel.send(bot.embeds.makeErrorEmbed("Cannot create match in this channel"));
        return;
    }

    if (bot.hasOngoingMatchInChannel(channel)) {
        channel.send(bot.embeds.makeErrorEmbed("There is already an ongoing match in this channel"));
        return;
    }

    let playerRed: Discord.GuildMember = args[0];
    let playerBlue: Discord.GuildMember = args[1];

    // validate users

    if (playerRed.id === playerBlue.id) {
        channel.send(bot.embeds.makeErrorEmbed("The two users must be different"));
        return;
    }

    if (bot.isUserInMatch(playerRed) || bot.isUserInMatch(playerBlue)) {
        channel.send(bot.embeds.makeErrorEmbed("One or more of the given players is already in a match"));
        return;
    }

    let match = bot.startMatch(playerRed, playerBlue, channel);
    match.game.turn = TeamColor.Red;
    match.game.setDebugLayout();
    channel.send(bot.embeds.makeMatchStartEmbed(match));
    channel.send(bot.embeds.makeGameViewEmbed(bot.gameRenderer, match));
}
