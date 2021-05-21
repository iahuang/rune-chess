/*
    A utility module for logging
*/

import chalk from "chalk";


interface Namespace {
    name: string;
    color: string;
    parent: Logger;
    info: (message: string) => void;
}

const COLORS = ["#ffde8c", "#ff9959", "#c7ff8c", "#8cffd7", "#8cd5ff", "#d58cff", "#ff8ce4"];

export class Logger {
    _namespaces = new Map<string, Namespace>();
    _longestNamespaceLength: number;
    termWidth: number;

    constructor() {
        this._longestNamespaceLength = 0;
        this.termWidth = Math.max(process.stdout.columns || 120, 60);
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
            info: function (message) {
                let prefix = `[${this.name}]`;
                // pad with spaces
                let maxlen = this.parent._longestNamespaceLength;

                prefix += " ".repeat(maxlen - this.name.length + 1);
                // let prefixLength = prefix.length;
                // let messageLength = message.length;
                // let overflow = prefixLength + messageLength - this.parent.termWidth;
                // if (overflow > 0) {
                //     message = message.substring(0, this.parent.termWidth - prefixLength - 4) + chalk.gray("...");
                // }
                console.log(chalk.hex(this.color)(prefix) + message);
            },
        });
        this._longestNamespaceLength = this._maxNSLength();
        return this;
    }
}
