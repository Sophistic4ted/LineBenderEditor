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
    TileType[TileType["C"] = 5] = "C";
    TileType[TileType["T"] = 6] = "T";
    TileType[TileType["P"] = 7] = "P";
    TileType[TileType["None"] = 8] = "None";
})(TileType || (TileType = {}));
(function (Direction) {
    Direction["North"] = "North";
    Direction["South"] = "South";
    Direction["East"] = "East";
    Direction["West"] = "West";
})(Direction || (Direction = {}));
export class Tile {
    type;
    location;
    line;
    sprite;
    nextTileDirection;
    previousTileDirection;
    constructor(type, location, line, sprite, nextTileDirection, previousTileDirection) {
        this.type = type;
        this.location = location;
        this.line = line;
        this.sprite = sprite;
        this.nextTileDirection = nextTileDirection;
        this.previousTileDirection = previousTileDirection;
    }
    setType(type) {
        this.type = type;
    }
    getType() {
        return this.type;
    }
    setSprite(sprite) {
        this.sprite = sprite;
    }
    setNextTileDirection(direction) {
        this.nextTileDirection = direction;
    }
    setPreviousTileDirection(direction) {
        this.previousTileDirection = direction;
    }
    setLine(line) {
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
