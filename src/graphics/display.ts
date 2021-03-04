import { Canvas, CanvasGradient, CanvasRenderingContext2D, createCanvas } from "canvas";
import { createWriteStream } from "fs";
import Vector2 from "./vector2";

export interface DrawStyle {
    fill?: string;
    stroke?: string;
    lineWidth?: number;
}

export interface TextStyle {
    font?: string; // defaults to sans-serif
    size: number; // in pixels
    fill: string;
    align?: CanvasTextAlign; // default: left
    baseline?: CanvasTextBaseline;
}

export class Display {
    private _canvas: Canvas;
    private _context: CanvasRenderingContext2D;
    private _defaultFont: string;

    private constructor(canvas: Canvas) {
        this._canvas = canvas;
        this._context = this._canvas.getContext("2d", { pixelFormat: "RGBA32" });
        this._defaultFont = "sans-serif";
    }

    setDefaultFont(font: string) {
        this._defaultFont = font;
    }

    getDefaultFont() {
        return this._defaultFont;
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

    circlePath(center: Vector2, radius: number) {
        this.context.arc(center.x, center.y, radius, 0, Math.PI * 2);
    }

    draw(pathFunction: Function, style: DrawStyle) {
        this.context.save();
        this.context.fillStyle = style.fill || "black";
        this.context.strokeStyle = style.stroke || "black";
        this.context.lineWidth = style.lineWidth || 1;
        this.context.beginPath();
        pathFunction();
        if (style.fill) {
            this.context.fill();
        }
        if (style.stroke) {
            this.context.stroke();
        }
        this.context.restore();
    }

    drawText(text: string, position: Vector2, style: TextStyle) {
        this.context.save();
        this.context.font = `${style.size}px ${style.font || this._defaultFont}`;
        this.context.textAlign = style.align || "left";
        this.context.fillStyle = style.fill;
        this.context.textBaseline = style.baseline || "top";
        this.context.fillText(text, position.x, position.y);
        this.context.restore();
    }

    clipped(clipFunction: Function, drawFunction: Function) {
        this.context.save();
        clipFunction();
        this.context.clip();
        drawFunction();
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
