import Discord from "discord.js";
import Globals from "../engine/globals";
import { TeamColor } from "../engine/team";
import { GameRenderer } from "../graphics/game_renderer";
import DataDragon from "../riot/data_dragon";
import { startMatchCommand } from "./commands/start_match";
import { EmbedGenerator } from "./embed";
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
    requiresGuild: boolean;
}

export interface CommandHandlerArgs {
    name: string;
    description: string;
    format: ArgumentFormat;
    callback: CommandCallback;
    requiresGuild?: boolean;
}

export interface GameCommandHandler {
    callback: GameCommandCallback;
    format: ArgumentFormat;
    description: string;
    aliases: string[];
}

export interface GameCommandHandlerArgs {
    name: string;
    aliases?: string[];
    description: string;
    format: ArgumentFormat;
    callback: GameCommandCallback;
}

export class RunechessBot extends Discord.Client {
    parser: CommandParser;
    config: BotConfig;
    embeds: EmbedGenerator;
    private commandHandlers: CommandHandlerTable;
    private gameCommandHandlers: GameCommandHandlerTable;

    gameRenderer: GameRenderer;

    ongoingMatches: Match[];

    constructor(dataDragon: DataDragon, config: BotConfig) {
        super();
        this.config = config;
        this.commandHandlers = {};
        this.gameCommandHandlers = {};
        this.ongoingMatches = [];

        this.parser = new CommandParser(config.prefix);
        this.gameRenderer = new GameRenderer(dataDragon);
        this.embeds = new EmbedGenerator({ embedColor: "#ffd261", dataDragon: dataDragon });
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
            requiresGuild: args.requiresGuild || false,
        };
    }

    registerGameCommand(args: GameCommandHandlerArgs) {
        this.gameCommandHandlers[args.name] = {
            callback: args.callback,
            format: args.format,
            description: args.description,
            aliases: args.aliases || [],
        };
    }

    resolveCommand(command: string) {
        for (let [name, handler] of Object.entries(this.commandHandlers)) {
            if (name === command) {
                return handler;
            }
        }
        return null;
    }

    resolveGameCommand(command: string) {
        for (let [name, handler] of Object.entries(this.gameCommandHandlers)) {
            if (name === command || handler.aliases.includes(command)) {
                return handler;
            }
        }
        return null;
    }

    private initDiscordEventHandlers() {
        this.on("message", (message) => {
            let content = message.content;

            if (message.channel.type === "news") {
                return;
            }

            if (this.config.debug) {
                if (content.startsWith(this.config.prefix + "debug")) {
                    let code = content.substring((this.config.prefix + "debug").length);
                    let output: string;
                    try {
                        output = eval(code);
                    } catch (err) {
                        output = err.toString();
                    }
                    message.channel.send(this.embeds.makeDebugInfoEmbed(output));
                    return;
                }
            }

            if (this.parser.isCommand(content)) {
                let parsed = this.parser.parse(message);

                let cmdHandler = this.resolveCommand(parsed.command);
                if (cmdHandler) {
                    let args;
                    try {
                        args = parsed.castArgs(cmdHandler.format);
                    } catch (err) {
                        message.channel.send(this.embeds.makeErrorEmbed(err.message));
                        return;
                    }
                    if (args) cmdHandler.callback(args, parsed);
                    return;
                }

                let gcmdHandler = this.resolveGameCommand(parsed.command);
                if (gcmdHandler) {
                    if (message.channel.type === "dm") {
                        message.channel.send(this.embeds.makeErrorEmbed("Game commands cannot be used in DMs"));
                        return;
                    }

                    let args;
                    try {
                        args = parsed.castArgs(gcmdHandler.format);
                    } catch (err) {
                        message.channel.send(this.embeds.makeErrorEmbed(err.message));
                        return;
                    }

                    if (!message.member) {
                        message.channel.send(this.embeds.makeErrorEmbed("Invalid user"));
                        return;
                    }

                    let userMatch = this.getUserMatchInfo(message.member);

                    if (!userMatch) {
                        message.channel.send(this.embeds.makeErrorEmbed("This command can only be sent while in-game"));
                        return;
                    }

                    if (userMatch.match.game.turn !== userMatch.teamColor && !this.config.debug) {
                        message.channel.send(this.embeds.makeErrorEmbed("It is not your turn!"));
                        return;
                    }

                    gcmdHandler.callback({
                        parsedArgs: args,
                        command: parsed,
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
            requiresGuild: true,
            callback: (args, command) => {
                startMatchCommand(this, args, command);
            },
        });

        this.registerCommand({
            name: "help",
            description: "displays this message",
            format: new ArgumentFormat(),
            callback: (args, command) => {
                command.message.channel.send(
                    this.embeds.makeHelpEmbed(this.config.prefix, this.commandHandlers, this.gameCommandHandlers)
                );
            },
        });

        this.registerCommand({
            name: "matches",
            description: "Lists the current matches in this server",
            requiresGuild: true,
            format: new ArgumentFormat(),
            callback: (args, command) => {
                command.message.channel.send(this.embeds.makeMatchListingEmbed(this, command.message.guild!.id));
            },
        });

        this.registerCommand({
            name: "info",
            description: "Lists the info and abilities for a champion",
            format: new ArgumentFormat().add("champion", ArgumentType.String),
            callback: (args, command) => {
                let champName = (args[0] as string).toLowerCase();

                if (Globals.championRegistry.allChampionNames().includes(champName)) {
                    let championConstructor = Globals.championRegistry.getConstructor(champName);
                    let champion = new championConstructor();

                    command.message.channel.send(this.embeds.makeChampionInfoEmbed(champion));
                } else {
                    command.message.channel.send(
                        this.embeds.makeErrorEmbed(`No champion with the name "${champName}" exists`)
                    );
                }
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

        this.registerCommand({
            name: "champions",
            description: "Lists all playable champions",
            format: new ArgumentFormat(),
            callback: (args, command) => {
                let channel = command.message.channel;
                channel.send(this.embeds.makeChampionRegistryEmbed(this.config.prefix))
            }
        })

        registerGameCommands(this);

        //this.onCommand("help", new ArgumentFormat().addOptional("command", ArgumentType.String), (args, command) => {});
    }

    run() {
        if (this.config.debug) console.log("[Runechess-Discord] Starting in DEBUG mode...");

        this.login(this.config.token);
    }
}
