import Discord from "discord.js";
import { format } from "path";
import { TeamColor } from "../engine/team";
import { makeErrorEmbed, makeHelpEmbed } from "./embed";
import Match from "./match";
import { ArgumentFormat, ArgumentType, CommandParser, ParsedCommand } from "./parser";

export class BotConfig {
    prefix = ".";
    token = "your_token_goes_here";
}

type CommandCallback = (parsedArgs: any[], command: ParsedCommand) => void;
export type CommandHandlerTable = { [cmd: string]: CommandHandler };

export interface CommandHandler {
    callback: CommandCallback;
    format: ArgumentFormat;
    description: string;
}

interface CommandHandlerArgs {
    name: string;
    description: string;
    format: ArgumentFormat;
    callback: CommandCallback;
}

export class RunechessBot extends Discord.Client {
    parser: CommandParser;
    config: BotConfig;
    private commandHandlers: CommandHandlerTable;

    ongoingMatches: Match[];

    constructor(params: BotConfig) {
        super();
        this.config = params;
        this.commandHandlers = {};
        this.ongoingMatches = [];

        this.parser = new CommandParser(params.prefix);
        this.initDiscordEventHandlers();
        this.initCommandHandlers();
    }

    registerCommand(args: CommandHandlerArgs) {
        this.commandHandlers[args.name] = {
            callback: args.callback,
            format: args.format,
            description: args.description,
        };
    }

    private initDiscordEventHandlers() {
        this.on("message", (message) => {
            let content = message.content;
            if (this.parser.isCommand(content)) {
                let command = this.parser.parse(message);

                let handler = this.commandHandlers[command.command];
                if (handler !== undefined) {
                    let args;
                    try {
                        args = command.castArgs(handler.format);
                    } catch (err) {
                        message.channel.send(makeErrorEmbed(err.message));
                    }

                    if (args) {
                        handler.callback(args, command);
                    }
                } else {
                    // command does not exist
                }
            }
        });

        this.on("ready", () => {
            console.log(`[Runechess-Discord] Logged in as ${this.user?.username}#${this.user?.discriminator}`);
        });
    }

    hasOngoingMatchInChannel(channel: Discord.TextChannel) {
        for (let match of this.ongoingMatches) {
            if (match.channel.id === channel.id) {
                return true;
            }
        }
        return false;
    }

    getUserMatchInfo(user: Discord.User) {
        /* Gets the match info for the given user. returns null if the user is not in game */
        for (let match of this.ongoingMatches) {
            if (match.hasUser(user)) {
                return {
                    match: match,
                    teamColor: match.playerBlue.id === user.id ? TeamColor.Blue : TeamColor.Red,
                };
            }
        }
        return null;
    }

    isUserInMatch(user: Discord.User) {
        return this.getUserMatchInfo(user) !== null;
    }

    startMatch(playerRed: Discord.User, playerBlue: Discord.User, inChannel: Discord.TextChannel) {
        let match = new Match({
            playerRed: playerRed,
            playerBlue: playerBlue,
            channel: inChannel,
        });
        this.ongoingMatches.push(match);
        match.begin();
    }

    private initCommandHandlers() {
        this.registerCommand({
            name: "test",
            description: "a test command",
            format: new ArgumentFormat()
                .add("some_string_argument", ArgumentType.String)
                .addOptional("a_user", ArgumentType.User),
            callback: (args) => {
                console.log(args);
            },
        });

        this.registerCommand({
            name: "startmatch",
            description: "Starts a Runechess match in the current channel",
            format: new ArgumentFormat().add("player1", ArgumentType.User).add("player2", ArgumentType.User),
            callback: (args, command) => {
                let channel = command.message.channel;

                if (!(channel instanceof Discord.TextChannel)) {
                    channel.send(makeErrorEmbed("Cannot create match in this channel"));
                    return;
                }

                if (this.hasOngoingMatchInChannel(channel)) {
                    channel.send(makeErrorEmbed("There is already an ongoing match in this channel"));
                    return;
                }

                let playerRed: Discord.User = args[0];
                let playerBlue: Discord.User = args[1];

                // validate users

                if (playerRed.id === playerBlue.id) {
                    channel.send(makeErrorEmbed("The two users must be different"));
                    return;
                }

                if (this.isUserInMatch(playerRed) || this.isUserInMatch(playerBlue)) {
                    channel.send(makeErrorEmbed("One or more of the given players is already in a match"));
                    return;
                }

                this.startMatch(playerRed, playerBlue, channel);
            },
        });

        this.registerCommand({
            name: "help",
            description: "displays this message",
            format: new ArgumentFormat(),
            callback: (args, command) => {
                command.message.channel.send(makeHelpEmbed(this.commandHandlers));
            },
        });

        //this.onCommand("help", new ArgumentFormat().addOptional("command", ArgumentType.String), (args, command) => {});
    }

    run() {
        this.login(this.config.token);
    }
}
