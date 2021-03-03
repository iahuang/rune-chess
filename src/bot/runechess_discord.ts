import Discord from "discord.js";
import { TeamColor } from "../engine/team";
import { GameRenderer } from "../graphics/game_renderer";
import { startMatchCommand } from "./commands/start_match";
import { makeDebugInfoEmbed, makeErrorEmbed, makeHelpEmbed, makeMatchListingEmbed } from "./embed";
import { registerGameCommands } from "./game_commands";
import Match from "./match";
import { ArgumentFormat, ArgumentType, CommandParser, ParsedCommand } from "./parser";

export class BotConfig {
    prefix = ".";
    token = "your_token_goes_here";
    debug = true;
}

export type CommandCallback = (parsedArgs: any[], command: ParsedCommand) => void;

export interface GameCommandCallInfo {
    parsedArgs: any[];
    command: ParsedCommand;
    match: Match;
    team: TeamColor;
}

export type GameCommandCallback = (info: GameCommandCallInfo) => void;
export type CommandHandlerTable = { [cmd: string]: CommandHandler };
export type GameCommandHandlerTable = { [cmd: string]: GameCommandHandler };

export interface CommandHandler {
    callback: CommandCallback;
    format: ArgumentFormat;
    description: string;
}

export interface GameCommandHandler {
    callback: GameCommandCallback;
    format: ArgumentFormat;
    description: string;
}

export interface CommandHandlerArgs {
    name: string;
    description: string;
    format: ArgumentFormat;
    callback: CommandCallback;
}

export interface GameCommandHandlerArgs {
    name: string;
    description: string;
    format: ArgumentFormat;
    callback: GameCommandCallback;
}

export class RunechessBot extends Discord.Client {
    parser: CommandParser;
    config: BotConfig;
    private commandHandlers: CommandHandlerTable;
    private gameCommandHandlers: GameCommandHandlerTable;

    gameRenderer: GameRenderer;

    ongoingMatches: Match[];

    constructor(params: BotConfig) {
        super();
        this.config = params;
        this.commandHandlers = {};
        this.gameCommandHandlers = {};
        this.ongoingMatches = [];

        this.parser = new CommandParser(params.prefix);
        this.gameRenderer = new GameRenderer();
        // start the discord handlers immediately after the game
        // renderer / assets are finished loading
        this.gameRenderer.init().then(() => this.init());
    }

    async init() {
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

    registerGameCommand(args: GameCommandHandlerArgs) {
        this.gameCommandHandlers[args.name] = {
            callback: args.callback,
            format: args.format,
            description: args.description,
        };
    }

    private initDiscordEventHandlers() {
        this.on("message", (message) => {
            let content = message.content;

            if (this.config.debug) {
                if (content.startsWith(this.config.prefix + "debug")) {
                    let code = content.substring((this.config.prefix + "debug").length);
                    let output: string;
                    try {
                        output = eval(code);
                    } catch (err) {
                        output = err.toString();
                    }
                    message.channel.send(makeDebugInfoEmbed(output));
                    return;
                }
            }

            if (this.parser.isCommand(content)) {
                let command = this.parser.parse(message);

                let handler = this.commandHandlers[command.command];
                if (handler !== undefined) {
                    let args;
                    try {
                        args = command.castArgs(handler.format);
                    } catch (err) {
                        message.channel.send(makeErrorEmbed(err.message));
                        return;
                    }

                    if (args) {
                        handler.callback(args, command);
                    }
                    return;
                }

                let gcHandler = this.gameCommandHandlers[command.command];
                if (gcHandler !== undefined) {
                    let args;
                    try {
                        args = command.castArgs(gcHandler.format);
                    } catch (err) {
                        message.channel.send(makeErrorEmbed(err.message));
                        return;
                    }

                    if (!message.member) {
                        message.channel.send(makeErrorEmbed("Invalid user"));
                        return;
                    }

                    let userMatch = this.getUserMatchInfo(message.member);

                    if (!userMatch) {
                        message.channel.send(makeErrorEmbed("This command can only be sent while in-game"));
                        return;
                    }

                    if (userMatch.match.game.turn !== userMatch.teamColor && !this.config.debug) {
                        message.channel.send(makeErrorEmbed("It is not your turn!"));
                        return;
                    }

                    gcHandler.callback({
                        parsedArgs: args,
                        command: command,
                        match: userMatch.match,
                        team: userMatch.teamColor,
                    });
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

    getUserMatchInfo(user: Discord.GuildMember) {
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

    isUserInMatch(user: Discord.GuildMember) {
        return this.getUserMatchInfo(user) !== null;
    }

    startMatch(playerRed: Discord.GuildMember, playerBlue: Discord.GuildMember, inChannel: Discord.TextChannel) {
        let match = new Match({
            playerRed: playerRed,
            playerBlue: playerBlue,
            channel: inChannel,
        });
        this.ongoingMatches.push(match);
        match.begin();
        return match;
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
                startMatchCommand(this, args, command);
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

        this.registerCommand({
            name: "matches",
            description: "Lists the current matches in this server",
            format: new ArgumentFormat(),
            callback: (args, command) => {
                command.message.channel.send(makeMatchListingEmbed(this, command.message.guild!.id));
            },
        });

        this.registerCommand({
            name: "debug_stop",
            description: "Stops all matches",
            format: new ArgumentFormat(),
            callback: () => {
                this.ongoingMatches = [];
            },
        });

        registerGameCommands(this);

        //this.onCommand("help", new ArgumentFormat().addOptional("command", ArgumentType.String), (args, command) => {});
    }

    run() {
        if (this.config.debug) console.log("[Runechess-Discord] Starting in DEBUG mode...");

        this.login(this.config.token);
    }
}
