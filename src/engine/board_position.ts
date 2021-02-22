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
        return (
            this.x >= 0 &&
            this.y >= 0 &&
            this.x < GameConstants.boardSize &&
            this.y <= GameConstants.boardSize
        );
    }

    static at(x: number, y: number) {
        return new BoardPosition(x, y);
    }

    chessNotation() {
        const letters = "ABCDEFGHIJKLMNOP";
        return letters[this.x] + (this.y+1);
    }

    isEqual(to: BoardPosition) {
        return this.x === to.x && this.y === to.y;
    }
}
