import GameConstants from "./constants";

export default class BoardPosition {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    directlyAdjacent() {
        return [
            new BoardPosition(this.x - 1, this.y),
            new BoardPosition(this.x + 1, this.y),
            new BoardPosition(this.x, this.y - 1),
            new BoardPosition(this.x, this.y + 1),
        ].filter((pos) => pos.isValid);
    }

    get isValid() {
        return this.x >= 0 && this.y >= 0 && this.x < GameConstants.boardSize && this.y <= GameConstants.boardSize;
    }

    static at(x: number, y: number) {
        return new BoardPosition(x, y);
    }

    chessNotation() {
        const letters = "ABCDEFGHIJKLMNOP";
        return letters[this.x] + (this.y + 1);
    }

    isEqual(to: BoardPosition) {
        return this.x === to.x && this.y === to.y;
    }

    static withinSquare(center: BoardPosition, pos: BoardPosition, radius: number) {
        /*
            Returns true if [pos] is within a square (2*[radius] + 1) squares in width and height around [center].

            In this example, all squares denoted by an "X" are within radius=1 of the square denoted by a "o"

            . . . . .
            . X X X .
            . X o X .
            . X X X .
            . . . . .

        */

        return Math.abs(center.x - pos.x) <= radius && Math.abs(center.y - pos.y) <= radius;
    }
}
