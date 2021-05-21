console.log(`Loading modules...`);

import { BotConfig, RunechessBot } from "./bot/runechess_discord";
import fs from "fs";
import DataDragon from "./riot/data_dragon";
import Globals from "./engine/globals";

const CONFIG_PATH = "./bot_config.json";

async function main() {
    Globals.log.getNamespace("Main").write(`Runechess ${Globals.gameVersion}`);
    Globals.programStartupTime = Date.now();
    if (!fs.existsSync(CONFIG_PATH)) {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(new BotConfig()));
        Globals.log.getNamespace("Runechess-Discord").write("Config file does not exist, creating...");
        process.exit(0);
    }
    let config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    let dataDragon = new DataDragon();
    await dataDragon.useLatestGameVersion();
    let bot = new RunechessBot(dataDragon, config);
    bot.run();
}

main().catch((err) => {
    Globals.log.logError(err);
});
