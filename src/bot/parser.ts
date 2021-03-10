import Discord from "discord.js";
import BoardPosition from "../engine/board_position";

export class ParseError {
    message: string;

    constructor(message: string) {
        this.message = message;
    }
}

export enum ArgumentType {
    User,
    Number,
    String,
}

export interface Argument {
    type: ArgumentType;
    name: string;
    optional: boolean;
}

export class ArgumentFormat {
    _args: Argument[];
    _none: boolean;
    constructor() {
        this._args = [];
        this._none = false;
    }
    add(name: string, type: ArgumentType) {
        this._args.push({
            type: type,
            name: name,
            optional: false,
        });

        return this;
    }
    addOptional(name: string, type: ArgumentType) {
        this._args.push({
            type: type,
            name: name,
            optional: true,
        });
        return this;
    }

    static none() {
        /*
            ArgumentFormat.none: specifies a "no format" format. the first element
            to ParsedCommand.rawArgs will be the contents of the message
        */
        let fmt = new ArgumentFormat();
        fmt._none = true;
        return fmt;
    }
}

export class ParsedCommand {
    command: string;
    rawArgs: string[];
    message: Discord.Message;

    constructor(command: string, args: string[], message: Discord.Message) {
        this.command = command;
        this.rawArgs = args;
        this.message = message;
    }

    castArgs(format: ArgumentFormat) {
        /* This is terrible code; please excuse */

        if (format._none) {
            return [this.rawArgs.join(" ")];
        }

        if (this.rawArgs.length > format._args.length) {
            throw new Error("Too many arguments");
        }
        let rawArgIndex = 0;
        let typedArgs: any[] = [];

        for (let expectedArg of format._args) {
            let rawArg = this.rawArgs[rawArgIndex];
            if (rawArg === undefined) {
                if (!expectedArg.optional) {
                    throw new Error("Missing argument(s)");
                } else {
                    typedArgs.push(null);
                    continue;
                }
            }
            let errReason = "unspecified";

            try {
                if (expectedArg.type === ArgumentType.Number) {
                    let n = Number.parseFloat(rawArg);

                    if (isNaN(n)) {
                        errReason = "Not a number";
                        throw new Error();
                    }
                    typedArgs.push(n);
                } else if (expectedArg.type === ArgumentType.User) {
                    let userIdMatch = rawArg.match(/\d+/g);
                    if (!userIdMatch) {
                        errReason = "Invalid mention";
                        throw new Error();
                    }
                    let user = this.message.guild?.members.cache.get(userIdMatch[0]);
                    if (!user) {
                        errReason = "Could not find user";
                        throw new Error();
                    }
                    typedArgs.push(user);
                } else {
                    typedArgs.push(rawArg);
                }
            } catch {
                throw new Error(`Argument ${rawArgIndex + 1} is invalid. Reason: ${errReason}`);
            }

            rawArgIndex++;
        }
        return typedArgs;
    }
}

export class CommandParser {
    prefix: string;
    constructor(prefix: string) {
        this.prefix = prefix;
    }

    isCommand(message: string) {
        return message.startsWith(this.prefix) && message.substring(this.prefix.length).trim() !== "";
    }

    parse(discordMessage: Discord.Message) {
        let message = discordMessage.content;
        if (!this.isCommand(message)) {
            throw new Error("Tried to parse non-command message");
        }
        // remove prefix
        message = message.substring(this.prefix.length);

        let parts = message.split(" ").filter((part) => part.trim() != "");
        let commandName = parts[0];
        let args = parts.slice(1);

        return new ParsedCommand(commandName, args, discordMessage);
    }
}
