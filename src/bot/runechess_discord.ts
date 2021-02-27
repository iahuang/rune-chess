import Discord from "discord.js";
import { format } from "path";
import { ArgumentFormat, ArgumentType, CommandParser, ParsedCommand } from "./parser";

export class BotConfig {
    prefix = ".";
    token = "your_token_goes_here";
}

type CommandCallback = (parsedArgs: any[], command: ParsedCommand) => void;

interface CommandHandler {
    callback: CommandCallback;
    format: ArgumentFormat;
}

export class RunechessBot extends Discord.Client {
    parser: CommandParser;
    config: BotConfig;
    private commandHandlers: { [cmd: string]: CommandHandler };

    constructor(params: BotConfig) {
        super();
        this.config = params;
        this.commandHandlers = {};

        this.parser = new CommandParser(params.prefix);
        this.initDiscordEventHandlers();
        this.initCommandHandlers();
    }

    onCommand(command: string, format: ArgumentFormat, callback: CommandCallback) {
        this.commandHandlers[command] = {
            callback: callback,
            format: format,
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
        this.onCommand(
            "test",
            new ArgumentFormat()
                .add("string argument", ArgumentType.String)
                .addOptional("user mention", ArgumentType.User),
            (args) => {
                console.log(args);
            }
        );
    }

    run() {
        this.login(this.config.token);
    }
}
