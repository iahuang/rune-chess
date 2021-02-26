import { Canvas, CanvasGradient, CanvasRenderingContext2D, createCanvas } from "canvas";
import { createWriteStream } from "fs";
import Vector2 from "./vector2";

type CanvasDrawStyle = string | CanvasGradient | CanvasPattern;

interface CanvasStyleState {
    fillStyle: CanvasDrawStyle;
    strokeStyle: CanvasDrawStyle;
    globalAlpha: number;
    lineWidth: number;
}

class StyleStack {
    private _stack: CanvasStyleState[];
    context: CanvasRenderingContext2D;

    constructor(context: CanvasRenderingContext2D) {
        this.context = context;
        this._stack = [];
    }

    push() {
        this._stack.push({
            fillStyle: this.context.fillStyle,
            strokeStyle: this.context.strokeStyle,
            globalAlpha: this.context.globalAlpha,
            lineWidth: this.context.lineWidth,
        });
    }

    pop() {
        let styleState = this._stack.pop();

    }
}

export default class Display {
    private _canvas: Canvas;
    private _context: CanvasRenderingContext2D;
    private strokeStack: CanvasDrawStyle[];

    private constructor(canvas: Canvas) {
        this._canvas = canvas;
        this._context = this._canvas.getContext("2d", { pixelFormat: "RGBA32" });
        this.strokeStack = [];
    }

    static create(width: number, height: number) {
        return new Display(createCanvas(width, height));
    }

    clear() {
        this.context.clearRect(0, 0, this.width, this.height);
    }

    drawLine(a: Vector2, b: Vector2, color: string, width = 1) {
        this.context.save();
        this.context.moveTo(a.x, a.y);
        this.context.lineTo(b.x, b.y);
        this.context.lineWidth = width;
        this.context.strokeStyle = color;
        this.context.stroke();
        this.context.restore();
    }

    drawRect(corner: Vector2, size: Vector2, color: string) {
        this.context.save();
        this.context.fillStyle = color;
        this.context.fillRect(corner.x, corner.y, size.x, size.y);
        this.context.restore();
    }

    get context() {
        return this._context;
    }

    get width() {
        return this._canvas.width;
    }

    get height() {
        return this._canvas.height;
    }

    getCanvasInstance() {
        return this._canvas;
    }

    async saveImageData(path: string) {
        return new Promise<void>((resolve, reject) => {
            let out = createWriteStream(path);
            let stream = this._canvas.createPNGStream();
            stream.pipe(out);
            out.on("finish", () => {
                out.close();
                resolve();
            });
        });
    }
}
