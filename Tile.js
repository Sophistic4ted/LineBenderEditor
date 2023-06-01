export var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Right"] = 1] = "Right";
    Direction[Direction["Down"] = 2] = "Down";
    Direction[Direction["Left"] = 3] = "Left";
})(Direction || (Direction = {}));
export var TileType;
(function (TileType) {
    TileType["Grass"] = "G";
    TileType["Bricks"] = "B";
    TileType["Win"] = "W";
    TileType["Swamp"] = "S";
    TileType["Key"] = "K";
    TileType["Door"] = "D";
    TileType["Trash"] = "T";
    TileType["Player"] = "P";
    TileType["None"] = "None";
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
    constructor(type, location, line = undefined, sprite, nextTileDirection, previousTileDirection) {
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
    isEmpty() {
        return this.type === TileType.None;
    }
    switchDirections() {
        const tmpDirection = this.nextTileDirection;
        this.nextTileDirection = this.previousTileDirection;
        this.previousTileDirection = tmpDirection;
    }
    isOnTheBeginningOfTheLine() {
        return this.previousTileDirection === undefined;
    }
    isOnTheEndOfTheLine() {
        return this.nextTileDirection === undefined;
    }
    isOnOneOfTheEndsOfTheLine() {
        return this.isOnTheEndOfTheLine() || this.isOnTheBeginningOfTheLine();
    }
}
