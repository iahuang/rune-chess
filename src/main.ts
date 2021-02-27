import { BotConfig, RunechessBot } from "./bot/runechess_discord";
import fs from "fs";

const CONFIG_PATH = "./config.json";

function main() {
    if (!fs.existsSync(CONFIG_PATH)) {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(new BotConfig()));
        console.log("[Runechess-Discord] Config file does not exist, creating...");
        process.exit(0);
    }
    let config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    let bot = new RunechessBot(config);
    bot.run();
}

main();