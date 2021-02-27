import Discord from "discord.js";
import { format } from "path";
import { makeHelpEmbed } from "./embed";
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

    constructor(params: BotConfig) {
        super();
        this.config = params;
        this.commandHandlers = {};

        this.parser = new CommandParser(params.prefix);
        this.initDiscordEventHandlers();
        this.initCommandHandlers();
    }

    onCommand(args: CommandHandlerArgs) {
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
                        message.channel.send("Error: " + err.message);
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

    private initCommandHandlers() {
        this.onCommand({
            name: "test",
            description: "a test command",
            format: new ArgumentFormat()
                .add("some_string_argument", ArgumentType.String)
                .addOptional("a_user", ArgumentType.User),
            callback: (args) => {
                console.log(args);
            },
        });

        this.onCommand({
            name: "help",
            description: "displays this message",
            format: new ArgumentFormat(),
            callback: (args, command) => {
                command.message.channel.send(makeHelpEmbed(this.commandHandlers))
            },
        });

        //this.onCommand("help", new ArgumentFormat().addOptional("command", ArgumentType.String), (args, command) => {});
    }

    run() {
        this.login(this.config.token);
    }
}
