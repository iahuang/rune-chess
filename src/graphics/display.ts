import { Canvas, CanvasRenderingContext2D, createCanvas } from "canvas";
import { createWriteStream } from "fs";

export default class Display {
    private _canvas: Canvas;
    private _context: CanvasRenderingContext2D;

    private constructor(canvas: Canvas) {
        this._canvas = canvas;
        this._context = this._canvas.getContext("2d", { pixelFormat: "RGBA32" });
    }

    static create(width: number, height: number) {
        return new Display(createCanvas(width, height));
    }

    clear() {
        this.context.clearRect(0, 0, this.width, this.height);
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
            out.on("finish", ()=>{
                out.close();
                resolve();
            })
        });
    }
}
