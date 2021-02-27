import { CommandHandlerTable } from "./runechess_discord";

import Discord from "discord.js";

const EMBED_COLOR = "#ffd261";

function makeEmbedBase(title: string) {
    return new Discord.MessageEmbed().setColor(EMBED_COLOR).setTitle(`Runechess - ${title}`);
}

export function makeHelpEmbed(commandTable: CommandHandlerTable) {
    let embed = makeEmbedBase("Command Help");
    
    for (let commandName of Object.keys(commandTable)) {
        let handler = commandTable[commandName];
        let commandSummary = commandName;
        if (handler.format._args.length === 0) {
            commandSummary += " (no arguments)";
        }
        for (let arg of handler.format._args) {
            commandSummary+=` [${arg.name}]`
            if (arg.optional) {
                commandSummary+="?";
            }
        }
        
        embed.addField(commandSummary, handler.description, true);
    }
    return embed;
}

export function makeErrorEmbed(errorMessage: string) {
    let embed = makeEmbedBase("Command Error");
    return embed.setDescription(`> ${errorMessage}\nUse the help command for more information`);
}