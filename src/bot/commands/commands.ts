import Globals from "../../engine/globals";
import { ArgumentFormat, ArgumentType } from "../parser";
import { RunechessBot } from "../bot";
import { startMatchCommand } from "./start_match";

export function registerCommands(bot: RunechessBot) {
    bot.registerCommand({
        name: "test",
        description: "a test command",
        format: new ArgumentFormat()
            .add("some_string_argument", ArgumentType.String)
            .addOptional("a_user", ArgumentType.User),
        callback: (args) => {
            console.log(args);
        },
    });

    bot.registerCommand({
        name: "startmatch",
        description: "Starts a Runechess match in the current channel",
        format: new ArgumentFormat().add("player1", ArgumentType.User).add("player2", ArgumentType.User),
        requiresGuild: true,
        callback: (args, command) => {
            startMatchCommand(bot, args, command);
        },
    });

    bot.registerCommand({
        name: "help",
        description: "Displays this message",
        format: new ArgumentFormat(),
        callback: (args, command) => {
            command.message.channel.send(
                bot.embeds.makeHelpEmbed(bot.config.prefix, bot._commandHandlers, bot._gameCommandHandlers)
            );
        },
    });

    bot.registerCommand({
        name: "matches",
        description: "Lists the current matches in this server",
        requiresGuild: true,
        format: new ArgumentFormat(),
        callback: (args, command) => {
            command.message.channel.send(bot.embeds.makeMatchListingEmbed(bot, command.message.guild!.id));
        },
    });

    bot.registerCommand({
        name: "info",
        description: "Lists the info and abilities for a champion",
        format: new ArgumentFormat().add("champion", ArgumentType.String),
        callback: (args, command) => {
            let query = (args[0] as string).toLowerCase();
            let registry = Globals.championRegistry;

            let internalChampName = registry.championNameByQuery(query);

            if (internalChampName) {
                let championConstructor = registry.getConstructor(internalChampName);
                let champion = new championConstructor();

                command.message.channel.send(bot.embeds.makeChampionInfoEmbed(champion));
            } else {
                bot.throwCommandError(
                    `No champion with the name "${query}" exists`,
                    `Use ${bot.inlineCommandName("champions")} for a list of all champions.`
                );
            }
        },
    });

    bot.registerCommand({
        name: "debug_stop",
        description: "Stops all matches",
        format: new ArgumentFormat(),
        callback: () => {
            bot.ongoingMatches = [];
        },
    });

    bot.registerCommand({
        name: "champions",
        description: "Lists all playable champions",
        format: new ArgumentFormat(),
        callback: (args, command) => {
            let channel = command.message.channel;
            channel.send(bot.embeds.makeChampionRegistryEmbed(bot.config.prefix));
        },
    });
}
