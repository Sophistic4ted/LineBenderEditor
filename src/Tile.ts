export enum Direction { U, R, D, L }
export enum TileType { G, B, W, S, K, D }

export class Tile {
    constructor(public type: TileType,
        public location: { x: number, y: number },
        public nextTileDirection?: Direction,
        public previousTileDirection?: Direction) { }
}

