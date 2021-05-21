/*
    A utility module for logging
*/

import chalk from "chalk";
import columnify from "columnify";
import fs from "fs";
import * as traceParser from "stacktrace-parser";

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

    logError(error: Error) {
        let stack = traceParser.parse(error.stack!);
        let tableData = stack.map((line) => {
            let sourcePreview = "";
            if (fs.existsSync(line.file || "") && line.lineNumber) {
                sourcePreview = fs.readFileSync(line.file!, "utf-8").split("\n")[line.lineNumber - 1];
                sourcePreview = sourcePreview.trim();
            }
            return [
                " ",
                "at " + line.methodName,
                line.file,
                line.lineNumber ? `line ${line.lineNumber}` : "",
                sourcePreview,
            ];
        });
        let data = columnify(tableData, {
            config: { 0: { minWidth: 4 } },
            maxLineWidth: "auto" as any,
            showHeaders: false,
            columnSplitter: "  ",
        });

        console.error(chalk.red(error.toString() + "\n" + data));
        fs.appendFileSync(
            logPath,
            "\n" +
                error.toString() +
                "\n" +
                columnify(tableData, {
                    config: { 0: { minWidth: 4 } },
                    showHeaders: false,
                    columnSplitter: "  ",
                })
        );
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
                fs.appendFileSync(logPath, "\n" + timestamp + " " + prefix + removeAnsi(message));
            },
        });
        this._longestNamespaceLength = this._maxNSLength();
        return this;
    }
}
