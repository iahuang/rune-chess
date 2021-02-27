/* Used for debug-rendering the board */

import Board from "../board";
import GameConstants from "../constants";
import child_process from "child_process";
import BoardPosition from "../board_position";

interface Config {
    cellWidth: number;
    cellHeight: number;
}

function _execSync(cmd: string) {
    return child_process.execSync(cmd, { encoding: "utf8" }).trim();
}

function getTermInfo() {
    return {
        cols: Number.parseInt(_execSync("tput cols")),
        rows: Number.parseInt(_execSync("tput lines")),
    };
}

function truncate(string: string, maxLength: number) {
    if (string.length > maxLength) {
        return string.substring(0, -1) + "…";
    }
    return string;
}

function pad(string: string, maxLength: number, withChar = " ") {
    return string + withChar.repeat(maxLength - string.length);
}

export default class ASCIIRenderer {
    outputBuffer: string; // used by .renderBoard and cleared on each call
    config: Config;

    constructor(config: Config) {
        this.outputBuffer = "";
        this.config = config;
    }

    private println(data: string) {
        this.outputBuffer += data + "\n";
    }

    private print(data: string) {
        this.outputBuffer += data;
    }

    private drawRowTopBottom() {
        for (let x = 0; x < GameConstants.boardSize; x++) {
            this.print("+");
            for (let i = 0; i < this.config.cellWidth; i++) {
                this.print("-");
            }
        }
        this.print("+");
        this.print("\n");
    }

    renderBoard(board: Board) {
        this.outputBuffer = "";
        for (let row = 0; row < GameConstants.boardSize; row++) {
            this.drawRowTopBottom();

            for (let y = 0; y < this.config.cellHeight; y++) {
                this.print("|");
                for (let col = 0; col < GameConstants.boardSize; col++) {
                    let pos = BoardPosition.at(col, row);
                    let unit = board.getUnitAt(pos);
                    if (y == 0) {
                        let cellHeader = pos.chessNotation();

                        if (unit) {
                            cellHeader += " " + unit.name;
                        }
                        this.print(pad(cellHeader, this.config.cellWidth));
                    } else if (y == 1) {
                        let hpDisplay = "";
                        if (unit) {
                            hpDisplay = unit.hp + "/" + unit.calculateMaxHP();
                        }
                        this.print(pad(hpDisplay, this.config.cellWidth));
                    } else {
                        this.print(" ".repeat(this.config.cellWidth));
                    }
                    this.print("|");
                }
                this.print("\n");
            }
        }
        this.drawRowTopBottom();
        // check to make sure that the rendering can fit in the terminal (if supported)
        try {
            let termInfo = getTermInfo();
            for (let bufferRow of this.outputBuffer.split("\n")) {
                if (bufferRow.length >= termInfo.cols) {
                    console.warn(
                        "warning: ascii render exceeds terminal bounds"
                    );
                    break;
                }
            }
        } catch {}

        return this.outputBuffer;
    }
}
