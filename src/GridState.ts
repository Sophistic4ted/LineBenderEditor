import { DirectionCalculator } from "./DirectionCalculator.js";
import { GridEditor } from "./GridEditor.js";
import { GridPosition } from "./GridPosition.js";
import { Player } from "./Player.js";
import { SpriteLoader } from "./SpriteLoader.js";
import { Direction, Tile, TileType } from "./Tile.js";


export class GridState {
  public static readonly gridTileSize: { width: number; height: number } = { width: 100, height: 100 };
  public tiles: Tile[][] = [];
  public lines: Array<Array<Tile>> = [];
  public player: Player = new Player({ x: 0, y: 0 }, undefined);

  private spriteLoader = new SpriteLoader();

  constructor(private objectFactory: Phaser.GameObjects.GameObjectFactory) {}

  public setObjectFactory(objectFactory: Phaser.GameObjects.GameObjectFactory) {
    this.objectFactory = objectFactory;
  }

  public isPositionEmpty(position: GridPosition): boolean {
    return !this.getTile(position) || this.getTile(position).isEmpty();
  }

  public setTileType(position: GridPosition, tileType: TileType): void {
    if(position.x === this.player.location.x && position.y === this.player.location.y) {
      this.removePlayer();
    }
    const tile = this.getTile(position);
    if(!tile || tile.isEmpty()) { return; }
    tile.setType(tileType);
    this.updateSprite(tile);
  }

  public createNewLineAt(position: GridPosition, tileType: TileType): void {
    const tile = this.getTile(position);
    if(!tile) { return; }
    if(!tile.isEmpty()) { return; }
    this.lines.push([]);
    this.lines[this.lines.length - 1].push(tile);
    tile.line = this.lines.length - 1;
    tile.nextTileDirection = undefined;
    tile.previousTileDirection = undefined;
    tile.type = tileType;
    this.updateSprite(tile);
  }

  public tryConnectingTiles(position1: GridPosition, position2: GridPosition): void {
    const tile1 = this.getTile(position1);
    const tile2 = this.getTile(position2);
    if(!tile1 || !tile2 || tile1.isEmpty() || tile2.isEmpty() || tile1.line === tile2.line) { return; }
    if(!tile1.isOnOneOfTheEndsOfTheLine() || !tile2.isOnOneOfTheEndsOfTheLine()) { return; }

    const line1Index = tile1.getLine();
    const line2Index = tile2.getLine();
    if(line1Index === undefined || line2Index === undefined) { return; }
    
    if(tile1.isOnTheEndOfTheLine() && tile2.isOnTheBeginningOfTheLine()) {
      this.connectLinesInOrder(line1Index, line2Index);
    } else
    if(tile1.isOnTheBeginningOfTheLine() && tile2.isOnTheEndOfTheLine()) {
      this.connectLinesInOrder(line2Index, line1Index);
    } else
    if(tile1.isOnTheBeginningOfTheLine() && tile2.isOnTheBeginningOfTheLine()) {
      this.reverseLine(line1Index);
      this.connectLinesInOrder(line1Index, line2Index);
    } else
    if(tile1.isOnTheEndOfTheLine() && tile2.isOnTheEndOfTheLine()) {
      this.reverseLine(line2Index);
      this.connectLinesInOrder(line1Index, line2Index);
    }
  }

  public placePlayer(position: GridPosition): void {
    this.removePlayer();
    const tile = this.getTile(position);
    if (!tile) { return; }
    if (tile.sprite !== undefined && tile.getType() !== TileType.Key && tile.getType() !== TileType.Bricks) {
      this.player.location.x = tile.location.x;
      this.player.location.y = tile.location.y;
      this.player.sprite = this.objectFactory.sprite(tile.location.x * GridEditor.tileSize + GridEditor.tileSize / 2, tile.location.y * GridEditor.tileSize + GridEditor.tileSize / 2, 'spritesheet', this.spriteLoader.getSpriteFrameByTileType(TileType.Player)).setOrigin(0.5);
    }
  }

  public removeTileAt(position: GridPosition) {
    if (!this.isWithinBounds(position)) {
      console.error("Attempted to remove tile out of grid bounds");
      return;
    }
    if(position.x === this.player.location.x && position.y === this.player.location.y) {
      this.removePlayer();
    }
    const tile = this.getTile(position);
    if(!tile || tile.isEmpty()) { return; }
    this.tryDisconnectingTilesAtPosition(position);

    const tileBefore = this.getTileBefore(position);
    if(tileBefore) {
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

  private removePlayer() {
    this.player.sprite?.destroy();  // remove sprite from scene
    this.player.sprite = undefined;  // remove sprite reference
  }

  private reverseLine(lineIndex: number): void {
    this.lines[lineIndex] = this.lines[lineIndex].reverse();
    this.lines[lineIndex].forEach(tile => {
      tile.switchDirections();
    })
  }

  private connectLinesInOrder(startLineIndex: number, endLineIndex: number): void {
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

  private tryDisconnectingTilesAtPosition(previousTilePosition: GridPosition): void {
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

  private getTileBefore(position: GridPosition): Tile | undefined {
    const tile = this.getTile(position);
    if(!tile || !tile.previousTileDirection) return undefined;
    const previousTilePosition = DirectionCalculator.addDirection(position, tile.previousTileDirection);
    return this.getTile(previousTilePosition);
  }

  private tryDisconnectingTiles(lineIndex: number, previousTileIndex: number): void {
    let previousTile = this.lines[lineIndex][previousTileIndex];
    let nextTile = this.lines[lineIndex][previousTileIndex + 1];
    if(!previousTile || !nextTile) { return; }
    previousTile.setNextTileDirection(undefined);
    nextTile.setPreviousTileDirection(undefined);
    this.updateSprite(nextTile);
    this.updateSprite(previousTile);
    
    const newLine = this.lines[lineIndex].splice(previousTileIndex + 1);
    this.lines.push(newLine);
    const newLineIndex = this.lines.length - 1;
    newLine.forEach(tile => tile.line = newLineIndex);
  }

  private emptyTile(tile: Tile): void {
    tile.setType(TileType.None);
    tile.setNextTileDirection(undefined);
    tile.setPreviousTileDirection(undefined);
    tile.sprite?.destroy();
    tile.sprite = undefined;
  }

  private removeLine(lineIndex: number): void {
    this.lines.splice(lineIndex, 1);
    for (let i = lineIndex; i < this.lines.length; i++) {
      this.lines[i].forEach(tile => tile.line = i);
    }
  }

  private getTile(position: GridPosition): Tile {
    return this.tiles.at(position.y)?.at(position.x) as Tile; // TODO: remove "as Tile" and fix every possible undefined errors
  }

  private isWithinBounds(position: GridPosition): boolean {
    return position.x >= 0 && position.y >= 0 && position.x < GridState.gridTileSize.width && position.y < GridState.gridTileSize.height;
  }

  private updateSprite(tile: Tile) {
    const previousDirection = tile.getPreviousTileDirection();
    const nextDirection = tile.getNextTileDirection();

    const { name: spriteName, rotation } = this.getSpriteData(tile.getType(), previousDirection, nextDirection);
    const spriteFrame = this.spriteLoader.getSpriteFrameByName(spriteName);
    if(spriteFrame === undefined) { return; }
    if (tile.sprite) {
      tile.sprite.setFrame(spriteFrame).setRotation(rotation);
    } else {
      const sprite = this.objectFactory.sprite(tile.location.x * GridEditor.tileSize + GridEditor.tileSize / 2, tile.location.y * GridEditor.tileSize + GridEditor.tileSize / 2, 'spritesheet', spriteFrame).setRotation(rotation).setOrigin(0.5);
      tile.sprite = sprite;
    }
  }

  private getSpriteData(tileType: TileType, previousDirection: Direction | undefined, nextDirection: Direction | undefined) {
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
    value.rotation = value.rotation * (Math.PI / 180)
    return value;
  }
}