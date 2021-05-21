/*
    A utility module for logging
*/

import chalk from "chalk";
import fs from "fs";

function removeAnsi(fromString: string) {
    return fromString.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, "");
}

interface Namespace {
    name: string;
    color: string;
    parent: Logger;
    write: (message: string) => void;
}

const COLORS = ["#ffde8c", "#ff9959", "#c7ff8c", "#8cffd7", "#8cd5ff", "#d58cff", "#ff8ce4"];
const logPath = "logs/latest.log";

export class Logger {
    _namespaces = new Map<string, Namespace>();
    _longestNamespaceLength: number;
    termWidth: number;

    constructor() {
        this._longestNamespaceLength = 0;
        this.termWidth = Math.max(process.stdout.columns || 120, 60);
        fs.writeFileSync(logPath, `Runechess Log | Created on ${new Date().toLocaleDateString("en-US")}`);
    }

    _nextColor() {
        return COLORS[this._namespaces.size % COLORS.length];
    }

    getNamespaces() {
        return Array.from(this._namespaces.values());
    }

    _maxNSLength() {
        let m = this.getNamespaces()[0].name.length;
        for (let n of this.getNamespaces()) {
            if (n.name.length > m) {
                m = n.name.length;
            }
        }
        return m;
    }

    getNamespace(withName: string) {
        return this._namespaces.get(withName)!;
    }

    addNamespace(name: string) {
        this._namespaces.set(name, {
            name: name,
            color: this._nextColor(),
            parent: this,
            write: function (message) {
                let prefix = `[${this.name}]`;
                // pad with spaces
                let maxlen = this.parent._longestNamespaceLength;

                prefix += " ".repeat(maxlen - this.name.length + 1);
                console.log(chalk.hex(this.color)(prefix) + message);

                // add to log file
                let now = new Date();
                let timestamp = `[${now.toLocaleTimeString("en-US", { hour12: false })}]`;
                fs.appendFileSync(logPath, "\r\n"+timestamp + " " + prefix + removeAnsi(message));
            },
        });
        this._longestNamespaceLength = this._maxNSLength();
        return this;
    }
}
