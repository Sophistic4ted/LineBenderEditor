export enum Direction { U, R, D, L }
export enum TileType { G, B, W, S, K, CD, T, None }
export enum Direction {
    North = 'North',
    South = 'South',
    East = 'East',
    West = 'West',
}
export class Tile {

    constructor(public type: TileType,
        public location: { x: number, y: number },
        public line?: number,
        public sprite?: Phaser.GameObjects.Sprite,
        public nextTileDirection?: Direction,
        public previousTileDirection?: Direction) { }

    setType(type: TileType) {
        this.type = type;
    }

    getType() {
        return this.type;
    }

    setSprite(sprite: Phaser.GameObjects.Sprite | undefined) {
        this.sprite = sprite;
    }

    setNextTileDirection(direction: Direction | undefined) {
        this.nextTileDirection = direction;
    }

    setPreviousTileDirection(direction: Direction | undefined) {
        this.previousTileDirection = direction;
    }

    setLine(line: number | undefined) {
        this.line = line;
    }

    getLine() {
        return this.line;
    }

    getNextTileDirection() {
        return this.nextTileDirection;
    }
    getPreviousTileDirection() {
        return this.previousTileDirection;
    }   
}

