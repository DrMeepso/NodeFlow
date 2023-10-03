// classes that can be considerd generic in nature, not generic TS classes

export class Vector2 {

    constructor(public x: number, public y: number) { }

    add(vector: Vector2) {
        return new Vector2(this.x + vector.x, this.y + vector.y);
    }

    sub(vector: Vector2) {
        return new Vector2(this.x - vector.x, this.y - vector.y);
    }

    mul(vector: Vector2) {
        return new Vector2(this.x * vector.x, this.y * vector.y);
    }

    div(vector: Vector2) {
        return new Vector2(this.x / vector.x, this.y / vector.y);
    }

    distance(vector: Vector2) {
        return Math.sqrt(Math.pow(this.x - vector.x, 2) + Math.pow(this.y - vector.y, 2));
    }

    static zero = new Vector2(0, 0);
    static one = new Vector2(1, 1);
    static up = new Vector2(0, 1);
    static down = new Vector2(0, -1);
    static left = new Vector2(-1, 0);
    static right = new Vector2(1, 0);

}