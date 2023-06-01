import { DirectionCalculator } from "./DirectionCalculator.js";
import { GridEditor } from "./GridEditor.js";
import { Bender } from "./Bender.js";
import { SpriteLoader } from "./SpriteLoader.js";
import { Direction, TileType } from "./Tile.js";
export class GridState {
    objectFactory;
    static gridTileSize = { width: 100, height: 100 };
    tiles = [];
    lines = [];
    bender = new Bender({ x: 0, y: 0 }, undefined);
    spriteLoader = new SpriteLoader();
    constructor(objectFactory) {
        this.objectFactory = objectFactory;
    }
    setObjectFactory(objectFactory) {
        this.objectFactory = objectFactory;
    }
    isPositionEmpty(position) {
        return !this.getTile(position) || this.getTile(position).isEmpty();
    }
    setTileType(position, tileType) {
        if (position.x === this.bender.location.x && position.y === this.bender.location.y) {
            this.removeBender();
        }
        const tile = this.getTile(position);
        if (!tile || tile.isEmpty()) {
            return;
        }
        tile.setType(tileType);
        this.updateSprite(tile);
    }
    createNewLineAt(position, tileType) {
        const tile = this.getTile(position);
        if (!tile) {
            return;
        }
        if (!tile.isEmpty()) {
            return;
        }
        this.lines.push([]);
        this.lines[this.lines.length - 1].push(tile);
        tile.line = this.lines.length - 1;
        tile.nextTileDirection = undefined;
        tile.previousTileDirection = undefined;
        tile.type = tileType;
        this.updateSprite(tile);
    }
    tryConnectingTiles(position1, position2) {
        const tile1 = this.getTile(position1);
        const tile2 = this.getTile(position2);
        if (!tile1 || !tile2 || tile1.isEmpty() || tile2.isEmpty() || tile1.line === tile2.line) {
            return;
        }
        if (!tile1.isOnOneOfTheEndsOfTheLine() || !tile2.isOnOneOfTheEndsOfTheLine()) {
            return;
        }
        const line1Index = tile1.getLine();
        const line2Index = tile2.getLine();
        if (line1Index === undefined || line2Index === undefined) {
            return;
        }
        if (tile1.isOnTheEndOfTheLine() && tile2.isOnTheBeginningOfTheLine()) {
            this.connectLinesInOrder(line1Index, line2Index);
        }
        else if (tile1.isOnTheBeginningOfTheLine() && tile2.isOnTheEndOfTheLine()) {
            this.connectLinesInOrder(line2Index, line1Index);
        }
        else if (tile1.isOnTheBeginningOfTheLine() && tile2.isOnTheBeginningOfTheLine()) {
            this.reverseLine(line1Index);
            this.connectLinesInOrder(line1Index, line2Index);
        }
        else if (tile1.isOnTheEndOfTheLine() && tile2.isOnTheEndOfTheLine()) {
            this.reverseLine(line2Index);
            this.connectLinesInOrder(line1Index, line2Index);
        }
    }
    placeBender(position) {
        this.removeBender();
        const tile = this.getTile(position);
        if (!tile) {
            return;
        }
        if (tile.sprite !== undefined && tile.getType() !== TileType.Key && tile.getType() !== TileType.Bricks) {
            this.bender.location.x = tile.location.x;
            this.bender.location.y = tile.location.y;
            this.bender.sprite = this.objectFactory.sprite(tile.location.x * GridEditor.tileSize + GridEditor.tileSize / 2, tile.location.y * GridEditor.tileSize + GridEditor.tileSize / 2, 'spritesheet', this.spriteLoader.getSpriteFrameByTileType(TileType.Bender)).setOrigin(0.5);
        }
    }
    removeTileAt(position) {
        if (!this.isWithinBounds(position)) {
            console.error("Attempted to remove tile out of grid bounds");
            return;
        }
        if (position.x === this.bender.location.x && position.y === this.bender.location.y) {
            this.removeBender();
        }
        const tile = this.getTile(position);
        if (!tile || tile.isEmpty()) {
            return;
        }
        this.tryDisconnectingTilesAtPosition(position);
        const tileBefore = this.getTileBefore(position);
        if (tileBefore) {
            this.tryDisconnectingTilesAtPosition(tileBefore.location);
        }
        this.emptyTile(tile);
        const lineIndex = tile.getLine();
        if (lineIndex === -1 || lineIndex === undefined) {
            console.error("Error: tile has no valid line index");
            return;
        }
        this.removeLine(lineIndex);
    }
    removeBender() {
        this.bender.sprite?.destroy(); // remove sprite from scene
        this.bender.sprite = undefined; // remove sprite reference
    }
    reverseLine(lineIndex) {
        this.lines[lineIndex] = this.lines[lineIndex].reverse();
        this.lines[lineIndex].forEach(tile => {
            tile.switchDirections();
        });
    }
    connectLinesInOrder(startLineIndex, endLineIndex) {
        const firstLine = this.lines[startLineIndex];
        const endOfFirstLineTile = firstLine[firstLine.length - 1];
        const secondLine = this.lines[endLineIndex];
        const beginningOfSecondLineTile = secondLine[0];
        endOfFirstLineTile.nextTileDirection = DirectionCalculator.getDirection(endOfFirstLineTile.location, beginningOfSecondLineTile.location);
        beginningOfSecondLineTile.previousTileDirection = DirectionCalculator.getDirection(beginningOfSecondLineTile.location, endOfFirstLineTile.location);
        this.updateSprite(endOfFirstLineTile);
        this.updateSprite(beginningOfSecondLineTile);
        firstLine.push(...secondLine);
        firstLine.forEach(tile => tile.line = startLineIndex);
        this.removeLine(endLineIndex);
    }
    tryDisconnectingTilesAtPosition(previousTilePosition) {
        const tile = this.getTile(previousTilePosition);
        const lineIndex = tile.getLine();
        if (tile.isEmpty() || lineIndex === undefined) {
            return;
        }
        const tileIndex = this.lines[lineIndex].indexOf(tile);
        if (tileIndex === -1) {
            return;
        }
        this.tryDisconnectingTiles(lineIndex, tileIndex);
    }
    getTileBefore(position) {
        const tile = this.getTile(position);
        if (!tile || !tile.previousTileDirection)
            return undefined;
        const previousTilePosition = DirectionCalculator.addDirection(position, tile.previousTileDirection);
        return this.getTile(previousTilePosition);
    }
    tryDisconnectingTiles(lineIndex, previousTileIndex) {
        let previousTile = this.lines[lineIndex][previousTileIndex];
        let nextTile = this.lines[lineIndex][previousTileIndex + 1];
        if (!previousTile || !nextTile) {
            return;
        }
        previousTile.setNextTileDirection(undefined);
        nextTile.setPreviousTileDirection(undefined);
        this.updateSprite(nextTile);
        this.updateSprite(previousTile);
        const newLine = this.lines[lineIndex].splice(previousTileIndex + 1);
        this.lines.push(newLine);
        const newLineIndex = this.lines.length - 1;
        newLine.forEach(tile => tile.line = newLineIndex);
    }
    emptyTile(tile) {
        tile.setType(TileType.None);
        tile.setNextTileDirection(undefined);
        tile.setPreviousTileDirection(undefined);
        tile.sprite?.destroy();
        tile.sprite = undefined;
    }
    removeLine(lineIndex) {
        this.lines.splice(lineIndex, 1);
        for (let i = lineIndex; i < this.lines.length; i++) {
            this.lines[i].forEach(tile => tile.line = i);
        }
    }
    getTile(position) {
        return this.tiles.at(position.y)?.at(position.x); // TODO: remove "as Tile" and fix every possible undefined errors
    }
    isWithinBounds(position) {
        return position.x >= 0 && position.y >= 0 && position.x < GridState.gridTileSize.width && position.y < GridState.gridTileSize.height;
    }
    updateSprite(tile) {
        const previousDirection = tile.getPreviousTileDirection();
        const nextDirection = tile.getNextTileDirection();
        const { name: spriteName, rotation } = this.getSpriteData(tile.getType(), previousDirection, nextDirection);
        const spriteFrame = this.spriteLoader.getSpriteFrameByName(spriteName);
        if (spriteFrame === undefined) {
            return;
        }
        if (tile.sprite) {
            tile.sprite.setFrame(spriteFrame).setRotation(rotation);
        }
        else {
            const sprite = this.objectFactory.sprite(tile.location.x * GridEditor.tileSize + GridEditor.tileSize / 2, tile.location.y * GridEditor.tileSize + GridEditor.tileSize / 2, 'spritesheet', spriteFrame).setRotation(rotation).setOrigin(0.5);
            tile.sprite = sprite;
        }
    }
    getSpriteData(tileType, previousDirection, nextDirection) {
        let tileTypeString = tileType;
        const directionMap = {
            [`${Direction.West}${Direction.North}`]: { name: `${tileTypeString}WN`, rotation: 0 },
            [`${Direction.North}${Direction.East}`]: { name: `${tileTypeString}WN`, rotation: 90 },
            [`${Direction.East}${Direction.South}`]: { name: `${tileTypeString}WN`, rotation: 180 },
            [`${Direction.South}${Direction.West}`]: { name: `${tileTypeString}WN`, rotation: 270 },
            [`${Direction.East}${Direction.West}`]: { name: `${tileTypeString}`, rotation: 0 },
            [`${Direction.South}${Direction.North}`]: { name: `${tileTypeString}`, rotation: 90 },
            [`undefined${Direction.East}`]: { name: `${tileTypeString}UN`, rotation: 180 },
            [`undefined${Direction.South}`]: { name: `${tileTypeString}UN`, rotation: 270 },
            [`undefined${Direction.West}`]: { name: `${tileTypeString}UN`, rotation: 0 },
            [`undefined${Direction.North}`]: { name: `${tileTypeString}UN`, rotation: 90 },
            [`undefinedundefined`]: { name: `${tileTypeString}UU`, rotation: 0 },
        };
        let value = undefined;
        if (directionMap[`${previousDirection}${nextDirection}`]) {
            value = directionMap[`${previousDirection}${nextDirection}`];
        }
        else if (directionMap[`${nextDirection}${previousDirection}`]) {
            value = directionMap[`${nextDirection}${previousDirection}`];
        }
        else {
            throw new Error(`Invalid combination of directions: ${previousDirection}, ${nextDirection}`);
        }
        value.rotation = value.rotation * (Math.PI / 180);
        return value;
    }
}
