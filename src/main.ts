import { BotConfig, RunechessBot } from "./bot/runechess_discord";
import fs from "fs";
import DataDragon from "./riot/data_dragon";

const CONFIG_PATH = "./bot_config.json";

async function main() {
    if (!fs.existsSync(CONFIG_PATH)) {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(new BotConfig()));
        console.log("[Runechess-Discord] Config file does not exist, creating...");
        process.exit(0);
    }
    let config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    let dataDragon = new DataDragon();
    await dataDragon.useLatestGameVersion();
    let bot = new RunechessBot(dataDragon, config);
    bot.run();
}

main();