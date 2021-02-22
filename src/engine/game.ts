import ASCIIRenderer from "./ascii_render";
import Board from "./board";

export default class RuneChess {
    board: Board;
    debugRenderer: ASCIIRenderer;

    constructor() {
        this.board = new Board();
        this.debugRenderer = new ASCIIRenderer({cellWidth: 12, cellHeight: 6});
    }
}