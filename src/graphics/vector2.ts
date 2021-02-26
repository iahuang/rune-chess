export default class Vector2 {
    x: number;
    y: number;

    private constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    clone() {
        return new Vector2(this.x, this.y);
    }

    get magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    set magnitude(to: number) {
        const v = this.normalized().times(to);
        this.x = v.x;
        this.y = v.y;
    }

    normalized() {
        const m = this.magnitude;
        return new Vector2(this.x / m, this.y / m);
    }

    times(factor: number): Vector2 {
        return new Vector2(this.x * factor, this.y * factor);
    }

    plus(b: Vector2) {
        return new Vector2(this.x + b.x, this.y + b.y);
    }

    minus(b: Vector2) {
        return new Vector2(this.x - b.x, this.y - b.y);
    }

    distance(to: Vector2) {
        return Math.sqrt(
            Math.pow(to.x - this.x, 2) + Math.pow(to.y - this.y, 2)
        );
    }

    static dot(a: Vector2, b: Vector2) {
        return a.x * b.x + a.y * b.y;
    }

    static lerp(a: Vector2, b: Vector2, t: number) {
        return new Vector2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
    }

    equals(b: Vector2) {
        return b.x === this.x && b.y === this.y;
    }

    floor() {
        return new Vector2(Math.floor(this.x), Math.floor(this.y));
    }

    ceil() {
        return new Vector2(Math.ceil(this.x), Math.ceil(this.y));
    }

    round() {
        return new Vector2(Math.round(this.x), Math.round(this.y));
    }

    static from(x: number, y: number) {
        return new Vector2(x, y);
    }

    static pair(n: number) {
        return new Vector2(n, n);
    }

    static get zero() {
        // shorthand for (0, 0)
        // shamelessly stolen from the unity engine api
        return new Vector2(0, 0);
    }

    spread(): [number, number] {
        return [this.x, this.y]
    }
}