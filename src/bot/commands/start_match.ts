import { ParsedCommand } from "../parser";
import Discord from "discord.js";
import { makeErrorEmbed, makeGameViewEmbed, makeMatchStartEmbed } from "../embed";
import { RunechessBot } from "../runechess_discord";
import { TeamColor } from "../../engine/team";

export function startMatchCommand(bot: RunechessBot, args: any[], command: ParsedCommand) {
    let channel = command.message.channel;

    if (!(channel instanceof Discord.TextChannel)) {
        channel.send(makeErrorEmbed("Cannot create match in this channel"));
        return;
    }

    if (bot.hasOngoingMatchInChannel(channel)) {
        channel.send(makeErrorEmbed("There is already an ongoing match in this channel"));
        return;
    }

    let playerRed: Discord.GuildMember = args[0];
    let playerBlue: Discord.GuildMember = args[1];

    // validate users

    if (playerRed.id === playerBlue.id) {
        channel.send(makeErrorEmbed("The two users must be different"));
        return;
    }

    if (bot.isUserInMatch(playerRed) || bot.isUserInMatch(playerBlue)) {
        channel.send(makeErrorEmbed("One or more of the given players is already in a match"));
        return;
    }

    let match = bot.startMatch(playerRed, playerBlue, channel);
    match.game.turn = TeamColor.Red;
    match.game.setDebugLayout();
    channel.send(makeMatchStartEmbed(match));
    channel.send(makeGameViewEmbed(bot.gameRenderer, match));
}
