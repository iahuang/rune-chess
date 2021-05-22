import chalk from "chalk";
import Discord from "discord.js";
import Globals from "../engine/globals";
import { TeamColor } from "../engine/team";
import { GameRenderer } from "../graphics/game_renderer";
import DataDragon from "../riot/data_dragon";
import { registerCommands } from "./commands/commands";
import { EmbedGenerator } from "./embed";
import { registerGameCommands } from "./commands/game_commands";
import { Match } from "./match";
import { ArgumentFormat, ArgumentType, CommandParser, ParsedCommand } from "./parser";

/*
    A special error class designed to be thrown
    inside during execution of a command.

    RunechessBot.
*/
export class CommandError {
    message: string;
    helpMessage: string;

    constructor(message: string, helpMessage: string = "") {
        this.message = message;
        this.helpMessage = helpMessage;
    }
}

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
    teamColor: TeamColor;
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
    _commandHandlers: CommandHandlerTable;
    _gameCommandHandlers: GameCommandHandlerTable;

    gameRenderer: GameRenderer;

    ongoingMatches: Match[];

    constructor(dataDragon: DataDragon, config: BotConfig) {
        super();
        this.config = config;
        this._commandHandlers = {};
        this._gameCommandHandlers = {};
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
        this._commandHandlers[args.name] = {
            callback: args.callback,
            format: args.format,
            description: args.description,
            requiresGuild: args.requiresGuild || false,
        };
    }

    registerGameCommand(args: GameCommandHandlerArgs) {
        this._gameCommandHandlers[args.name] = {
            callback: args.callback,
            format: args.format,
            description: args.description,
            aliases: args.aliases || [],
        };
    }

    resolveCommandHandler(command: string) {
        for (let [name, handler] of Object.entries(this._commandHandlers)) {
            if (name === command) {
                return handler;
            }
        }
        return null;
    }

    resolveGameCommand(command: string) {
        for (let [name, handler] of Object.entries(this._gameCommandHandlers)) {
            if (name === command || handler.aliases.includes(command)) {
                return handler;
            }
        }
        return null;
    }

    _runCommandCallback(channel: Discord.TextChannel | Discord.NewsChannel | Discord.DMChannel, executor: () => void) {
        /*
            Run the provided inline function in a "safe"
            execution environment.
            Any thrown CommandErrors are displayed as
            error message embeds, and any other errors
            are thrown normally.
        */

        try {
            executor();
        } catch (err) {
            if (err instanceof CommandError) {
                channel.send(this.embeds.makeErrorEmbed(err.message, err.helpMessage));
                return;
            }
            // if it's not specifically a command error that was caught
            // assume it was an internal error; i.e. something
            // wrong with the code or some other uncaught exception
            // and throw it normally.
            throw err;
        }
    }

    handleGameCommand(message: Discord.Message, handler: GameCommandHandler, commandData: ParsedCommand) {
        if (message.channel.type === "dm") {
            message.channel.send(this.embeds.makeErrorEmbed("Game commands cannot be used in DMs"));
            return;
        }

        let args: any[];
        try {
            args = commandData.castArgs(handler.format);
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

        this._runCommandCallback(message.channel, () => {
            handler.callback({
                parsedArgs: args,
                command: commandData,
                match: userMatch!.match,
                teamColor: userMatch!.teamColor,
            });
        });
    }

    handleCommand(message: Discord.Message) {
        let parsed = this.parser.parse(message);

        // Attempt to run the command
        let cmdHandler = this.resolveCommandHandler(parsed.command);
        if (cmdHandler) {
            let args: any[];
            try {
                args = parsed.castArgs(cmdHandler.format);
            } catch (err) {
                message.channel.send(this.embeds.makeErrorEmbed(err.message));
                return;
            }

            this._runCommandCallback(message.channel, () => {
                cmdHandler!.callback(args, parsed);
            });

            return;
        }

        // Otherwise, attempt to run a game command
        let gcmdHandler = this.resolveGameCommand(parsed.command);
        if (gcmdHandler) {
            this.handleGameCommand(message, gcmdHandler, parsed);
        }
    }

    private initDiscordEventHandlers() {
        this.on("message", (message) => {
            let content = message.content;

            if (message.channel.type === "news") {
                return;
            }

            if (this.config.debug) {
                // Init debug "eval" command
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

            // Handle command parsing and execution

            if (this.parser.isCommand(content)) {
                this.handleCommand(message);
            }
        });

        this.on("ready", () => {
            Globals.log
                .getNamespace("Runechess-Discord")
                .write(`Logged in as ${this.user?.username}#${this.user?.discriminator}`);
            let time = Date.now() - Globals.programStartupTime;
            Globals.log.getNamespace("Runechess-Discord").write(`Ready in ${Math.round(time)}ms from startup`);
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

    throwCommandError(message: string, helpMessage: string = ""): never {
        throw new CommandError(message, helpMessage);
    }

    inlineCommandName(commandName: string) {
        /*
            Returns the command name enclosed in backticks for code formatting
            and prefixed with the proper command prefix, according to the
            bot configuation.
        */

        return "`" + this.config.prefix + commandName + "`";
    }

    private initCommandHandlers() {
        registerCommands(this);
        registerGameCommands(this);

        //this.onCommand("help", new ArgumentFormat().addOptional("command", ArgumentType.String), (args, command) => {});
    }

    run() {
        if (this.config.debug)
            Globals.log.getNamespace("Runechess-Discord").write(`Starting in ${chalk.magenta("debug")} mode...`);

        this.login(this.config.token);
    }
}
