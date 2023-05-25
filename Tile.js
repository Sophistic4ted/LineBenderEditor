export var Direction;
(function (Direction) {
    Direction[Direction["U"] = 0] = "U";
    Direction[Direction["R"] = 1] = "R";
    Direction[Direction["D"] = 2] = "D";
    Direction[Direction["L"] = 3] = "L";
})(Direction || (Direction = {}));
export var TileType;
(function (TileType) {
    TileType[TileType["G"] = 0] = "G";
    TileType[TileType["B"] = 1] = "B";
    TileType[TileType["W"] = 2] = "W";
    TileType[TileType["S"] = 3] = "S";
    TileType[TileType["K"] = 4] = "K";
    TileType[TileType["D"] = 5] = "D";
})(TileType || (TileType = {}));
export class Tile {
    type;
    location;
    nextTileDirection;
    previousTileDirection;
    constructor(type, location, nextTileDirection, previousTileDirection) {
        this.type = type;
        this.location = location;
        this.nextTileDirection = nextTileDirection;
        this.previousTileDirection = previousTileDirection;
    }
}
