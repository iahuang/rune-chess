import { ParsedCommand } from "../parser";
import Discord from "discord.js";
import { RunechessBot } from "../runechess_discord";
import { TeamColor } from "../../engine/team";

export function startMatchCommand(bot: RunechessBot, args: any[], command: ParsedCommand) {
    let channel = command.message.channel;

    if (!(channel instanceof Discord.TextChannel)) {
        bot.throwCommandError("Cannot create match in this channel");
    }

    if (bot.hasOngoingMatchInChannel(channel)) {
        bot.throwCommandError("There is already an ongoing match in this channel");
    }

    let playerRed: Discord.GuildMember = args[0];
    let playerBlue: Discord.GuildMember = args[1];

    // validate users

    if (playerRed.id === playerBlue.id) {
        bot.throwCommandError("The two users must be different");
        return;
    }

    if (bot.isUserInMatch(playerRed) || bot.isUserInMatch(playerBlue)) {
        bot.throwCommandError("One or more of the given players is already in a match");
        return;
    }

    let match = bot.startMatch(playerRed, playerBlue, channel);
    match.game.turn = TeamColor.Red;
    match.game.setDebugLayout();
    channel.send(bot.embeds.makeMatchStartEmbed(match));
    channel.send(bot.embeds.makeGameViewEmbed(bot.gameRenderer, match));
}
