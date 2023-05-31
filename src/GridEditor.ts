import { SpriteLoader } from "./SpriteLoader.js";
import { TileSelector } from "./TileSelector.js";
import eventsCenter from "./EventsCenter.js";
import { TileType, Tile, Direction } from "./Tile.js";
import { ToolHandler } from "./ToolHandler.js";
import { Player } from "./Player.js";

export class GridEditor extends Phaser.Scene {
  public tileSize: number = 28;
  public menuWidth: number = 385;

  private gridTileSize: { width: number; height: number } = { width: 100, height: 100 };
  private isDragging: boolean = false;
  public isDrawing: boolean = false;

  private dragPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
  private worldBounds: { x: number; y: number };
  private spriteLoader: SpriteLoader;
  private tiles: Tile[][] = [];
  private toolHandler: ToolHandler;
  public tempLineNumber: number | undefined = undefined;
  public lines: Array<Array<Tile>> = [];
  public addToBeginning: boolean = false;
  public player: Player = new Player({ x: 0, y: 0 }, undefined);
  constructor() {
    super({ key: 'GridEditor' });
    this.worldBounds = {
      x: this.gridTileSize.width * this.tileSize,
      y: this.gridTileSize.height * this.tileSize
    };
    this.spriteLoader = new SpriteLoader();
    this.toolHandler = new ToolHandler(this);
  }

  preload() {
    this.initTileMap();
    this.spriteLoader.preloadSprites(this);
  }

  create() {
    this.input.on('pointerdown', this.handleMouseDown, this);
    this.input.on('pointermove', this.handleMouseMove, this);
    this.input.on('pointerup', this.handleMouseUp, this);
    this.input.on('wheel', this.handleMouseWheel, this);
    this.input.on('pointerdown', this.toolHandler.handlePointerDown.bind(this.toolHandler))
    this.input.on('pointermove', this.toolHandler.handlePointerMove.bind(this.toolHandler))
    this.input.on('pointerup', this.toolHandler.handlePointerUp.bind(this.toolHandler))

    this.scale.on('resize', this.handleResize, this);

    this.input.keyboard?.on('keydown-C', async () => {
      const textToCopy = this.exportLines();
      try {
        await navigator.clipboard.writeText(textToCopy);
      } catch (err) {
        console.error('Error in copying text: ', err);
      }
    });


    this.input.keyboard?.on('keydown-V', async () => {
      try {
        const readText = await navigator.clipboard.readText();
        this.importLines(readText);
      } catch (err) {
        console.error('Error in copying text: ', err);
      }
    });

    eventsCenter.on('update-tool', this.updateTool, this)
    this.add.grid(
      0,
      0,
      this.worldBounds.x,
      this.worldBounds.y,
      this.tileSize,
      this.tileSize,
      0x1a1a1a,
    ).setOrigin(0); // Set grid's origin to the top-left corner

    this.cameras.main.setViewport(this.menuWidth, 0, this.scale.width - this.menuWidth, this.scale.height);
    // Set camera bounds
    this.cameras.main.setBounds(0, 0, this.worldBounds.x, this.worldBounds.y);

    // Center the camera
    this.cameras.main.centerOn(this.worldBounds.x / 2, this.worldBounds.y / 2);
    this.cameras.main.setZoom(2);
  }

  initTileMap() {
    for (let y = 0; y < this.gridTileSize.height; y++) {
      let row: Tile[] = [];
      for (let x = 0; x < this.gridTileSize.width; x++) {
        let tile = new Tile(TileType.None, { x: x, y: y });
        tile.setSprite(undefined);
        row.push(tile);
      }
      this.tiles.push(row);
    }
  }

  private updateTool(tool: TileType) {
    this.toolHandler.setTool(tool);
  }

  placeAt(x: number, y: number, type: TileType, isStart: boolean = false) {
    if (this.tiles[y][x].sprite === undefined) {
      this.processEmptyField(x, y, type, isStart);
    } else {
      this.processOccupiedField(y, x, type, isStart);
    }
  }

  removeAt(x: number, y: number) {
    if (!this.isWithinBounds(x, y)) {
      console.error("Attempted to remove tile out of grid bounds");
      return;
    }

    const tile = this.tiles[y][x];
    const lineIndex = tile.getLine();

    // If the tile is already removed, just return
    if (tile.getType() === TileType.None || lineIndex === undefined) {
      return;
    }

    const tileIndex = this.lines[lineIndex].indexOf(tile);

    // If the tile is not found in the line, return
    if (tileIndex === -1) {
      return;
    }

    this.lines[lineIndex].splice(tileIndex, 1);

    tile.setType(TileType.None);
    tile.setNextTileDirection(undefined);
    tile.setPreviousTileDirection(undefined);
    tile.sprite?.destroy();  // remove sprite from scene
    tile.sprite = undefined;  // remove sprite reference
    this.updateSprite(tile)

    // If the line has no more tiles
    if (this.lines[lineIndex].length === 0) {
      // Remove the line itself
      this.lines.splice(lineIndex, 1);

      // Update line indices for remaining lines
      for (let i = lineIndex; i < this.lines.length; i++) {
        this.lines[i].forEach(tile => tile.line = i);
      }
    }
    else if (tileIndex <= this.lines[lineIndex]?.length) {
      let nextTile = this.lines[lineIndex][tileIndex]
      let previousTile = this.lines[lineIndex][tileIndex - 1]
      nextTile?.setPreviousTileDirection(undefined);
      previousTile?.setNextTileDirection(undefined);
      this.updateSprite(nextTile);
      this.updateSprite(previousTile);
      const newLine = this.lines[lineIndex].splice(tileIndex);
      this.lines.push(newLine);
      newLine.forEach(tile => tile.line = this.lines.length - 1);
    }
  }

  isCorrectMovement(x: number, y: number): boolean {
    const line = this.tiles[y][x].getLine();
    if (line !== undefined) {
      if (this.lines[line]?.length > 0) {
        let lastTile = this.lines[line][this.lines[line].length - 1];
        if (this.addToBeginning) {
          lastTile = this.lines[line][0];
        }
        if (!this.checkContinuity(lastTile.location, { x: x, y: y })) {
          return false;
        }
      }
    }
    return true;
  }

  checkContinuity(from: { x: number, y: number }, to: { x: number, y: number }): boolean {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);

    // Only one of dx and dy should be 1, and the other should be 0
    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
      return true;
    }
    return false;
  }

  getDirection(from: { x: number, y: number }, to: { x: number, y: number }): Direction | undefined {
    if (from.x === to.x) {
      return from.y < to.y ? Direction.South : Direction.North;
    } else if (from.y === to.y) {
      return from.x < to.x ? Direction.East : Direction.West;
    } else {
      return undefined;
    }
  }

  getSpriteData(tileType: TileType, previousDirection: Direction | undefined, nextDirection: Direction | undefined) {
    let tileTypeString = TileType[tileType]
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

  oppositeDirection(direction: Direction): Direction | undefined {
    switch (direction) {
      case Direction.North:
        return Direction.South;
      case Direction.South:
        return Direction.North;
      case Direction.East:
        return Direction.West;
      case Direction.West:
        return Direction.East;
    }
  }

  private processOccupiedField(y: number, x: number, type: TileType, isStart: boolean = false, lineIndex: number = 0) {
    const tile = this.tiles[y][x];
    if (tile !== undefined) {
      if (tile.type !== type) {
        this.processFieldWithDifferentSprite(y, x, type);
      }
      if (isStart && (tile.previousTileDirection === undefined || tile.nextTileDirection === undefined) && this.isDrawing && this.tempLineNumber === undefined) {
        this.tempLineNumber = tile.getLine();
        if (tile.previousTileDirection === undefined) {
          this.addToBeginning = true;
        }
      }
      if (this.tempLineNumber !== undefined && tile.getLine() !== this.tempLineNumber && (tile.previousTileDirection === undefined || tile.nextTileDirection === undefined)) {
        const tileLine = tile.getLine();
        if (tileLine !== undefined) {
          const tempLine = this.lines[this.tempLineNumber]
          if (tempLine !== undefined) {
            let lastTile = tempLine.at(tempLine.length - 1)
            if (this.addToBeginning) {
              lastTile = tempLine.at(0)
            }
            if (lastTile !== undefined) {
              let direction = this.getDirection(lastTile.location, tile.location);
              if (this.addToBeginning) {
                direction = this.getDirection(tile.location, lastTile.location);
              }
              if (direction !== undefined) {
                if (this.addToBeginning) {
                  if (tile.getPreviousTileDirection() === undefined) {
                    tile.setPreviousTileDirection(direction);
                    lastTile.setPreviousTileDirection(this.oppositeDirection(direction));
                    this.lines[tileLine].forEach(tile => {
                      const tempDirection = tile.getNextTileDirection();
                      tile.setNextTileDirection(tile.getPreviousTileDirection());
                      tile.setPreviousTileDirection(tempDirection);
                    });
                    tempLine.unshift(...this.lines[tileLine].reverse());
                    this.lines.splice(tileLine, 1);
                  } else if (tile.getNextTileDirection() === undefined) {
                    lastTile.setPreviousTileDirection(this.oppositeDirection(direction));
                    tile.setNextTileDirection(direction);
                    tempLine.unshift(...this.lines[tileLine]);
                    this.lines.splice(tileLine, 1);
                  }
                } else {
                  if (tile.getNextTileDirection() === undefined) {
                    tile.setNextTileDirection(this.oppositeDirection(direction));
                    lastTile.setNextTileDirection(direction);
                    this.lines[tileLine].forEach(tile => {
                      const tempDirection = tile.getNextTileDirection();
                      tile.setNextTileDirection(tile.getPreviousTileDirection());
                      tile.setPreviousTileDirection(tempDirection);
                    });
                    tempLine.push(...this.lines[tileLine].reverse());

                    this.lines.splice(tileLine, 1);
                  } else if (tile.getPreviousTileDirection() === undefined) {
                    lastTile.setNextTileDirection(direction);
                    tile.setPreviousTileDirection(this.oppositeDirection(direction));
                    tempLine.push(...this.lines[tileLine]);
                    this.lines.splice(tileLine, 1);
                  }
                }
                this.updateSprite(tile);
                this.updateSprite(lastTile);
                const lastTileLine = lastTile.getLine();
                if (tileLine !== undefined && lastTileLine !== undefined) {
                  if (tileLine > lastTileLine) {
                    tempLine.forEach(tile => tile.line = this.tempLineNumber ? this.tempLineNumber : 0);
                  } else {
                    tempLine.forEach(tile => tile.line = tileLine);
                  }
                }
              }
            }
          }
        }
      }
      if (tile.getLine() !== undefined) {
        if (this.tempLineNumber !== tile.getLine() && this.lines.length - 1 !== tile.getLine()) {
          this.isDrawing = false;
        }
      }
    }
  }

  private processFieldWithDifferentSprite(y: number, x: number, type: TileType) {
    this.tiles[y][x].sprite?.destroy(); // remove sprite from scene
    this.tiles[y][x].sprite = undefined; // remove sprite reference
    this.spriteLoader.getSpriteFrameById(type);
    this.createSprite(x, y, type);
  }

  private isWithinBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.gridTileSize.width && y < this.gridTileSize.height;
  }

  private getSpriteFrame(type: string) {
    const spriteFrame = this.spriteLoader.getSpriteFrameByName(type);
    if (spriteFrame === undefined) {
      console.error("Attempted to place tile with an unregistered sprite");
    }
    return spriteFrame;
  }

  private processEmptyField(x: number, y: number, type: TileType, isStart: boolean = false) {
    const tile = this.tiles[y][x];
    if (this.isDrawing) {
      if (isStart) {
        this.lines.push([])
      }
      const line = this.tempLineNumber !== undefined ? this.tempLineNumber : (this.lines.length - 1);

      this.tiles[y][x].setLine(line);
      if (!this.isCorrectMovement(x, y)) {
        this.tiles[y][x].setLine(undefined);
        return
      }
      if (this.addToBeginning) {
        this.lines[line].unshift(this.tiles[y][x]);
      } else {
        this.lines[line].push(this.tiles[y][x]);
      }
      this.updateNeighbours(x, y);
      this.createSprite(x, y, type);
    }
  }


  private updateNeighbours(x: number, y: number) {
    const tile = this.tiles[y][x];
    const line = this.tiles[y][x].getLine();

    if (line !== undefined && this.lines[line].length > 1) {
      if (this.addToBeginning) {
        const nextTile = this.lines[line][1];
        const direction = this.getDirection({ x: x, y: y }, nextTile.location);
        if (direction) {
          nextTile.setPreviousTileDirection(this.oppositeDirection(direction));
          this.tiles[y][x].setNextTileDirection(direction);
          this.updateSprite(nextTile)
          this.updateSprite(this.tiles[y][x])
        }
      } else {
        const lastTile = this.lines[line][this.lines[line].length - 2];
        const direction = this.getDirection(lastTile.location, { x: x, y: y });
        if (direction) {
          lastTile.setNextTileDirection(direction);
          this.tiles[y][x].setPreviousTileDirection(this.oppositeDirection(direction));
          this.updateSprite(lastTile)
          this.updateSprite(this.tiles[y][x])
        }
      }
    }
  }


  private updateSprite(tile: Tile) {
    if (tile !== undefined) {
      const previousDirection = tile.getPreviousTileDirection();
      const nextDirection = tile.getNextTileDirection();

      const { name: spriteName, rotation } = this.getSpriteData(tile.getType(), previousDirection, nextDirection);
      const spriteFrame = this.spriteLoader.getSpriteFrameByName(spriteName)
      if (spriteFrame !== undefined) {
        tile.sprite?.setFrame(spriteFrame).setRotation(rotation);
      }
    }
  }

  private createSprite(x: number, y: number, type: TileType) {
    // Finally, we create the sprite and set its rotation.
    const previousDirection = this.tiles[y][x].getPreviousTileDirection();
    const nextDirection = this.tiles[y][x].getNextTileDirection();

    const { name: spriteName, rotation } = this.getSpriteData(type, previousDirection, nextDirection);
    const spriteFrame = this.getSpriteFrame(spriteName)
    const lineNumber = this.tiles[y][x].getLine()
    const sprite = this.add.sprite(x * this.tileSize + this.tileSize / 2, y * this.tileSize + this.tileSize / 2, 'spritesheet', spriteFrame).setRotation(rotation).setOrigin(0.5);
    this.tiles[y][x].setType(type);
    this.tiles[y][x].sprite = sprite;
  }

  placePlayer(x: number, y: number) {
    if (this.tiles[y][x].sprite !== undefined && TileType[this.tiles[y][x].getType()] !== "K" && TileType[this.tiles[y][x].getType()] !== "B") {
      this.player.location.x = x;
      this.player.location.y = y;
      this.player.sprite = this.add.sprite(x * this.tileSize + this.tileSize / 2, y * this.tileSize + this.tileSize / 2, 'spritesheet', this.spriteLoader.getSpriteFrameById(TileType.P)).setOrigin(0.5);
    }
  }

  removePlayer(x: number, y: number) {
    this.player.sprite?.destroy();  // remove sprite from scene
    this.player.sprite = undefined;  // remove sprite reference
  }


  private handleMouseDown(pointer: Phaser.Input.Pointer) {
    const camera = this.cameras.main;
    if (
      pointer.middleButtonDown() &&
      pointer.x > camera.x && pointer.x < camera.x + camera.width &&
      pointer.y > camera.y && pointer.y < camera.y + camera.height
    ) {
      this.isDragging = true;
      this.dragPosition.set(pointer.x, pointer.y);
    }
  }

  private handleMouseMove(pointer: Phaser.Input.Pointer) {
    if (pointer.middleButtonDown()) {
      const camera = this.cameras.main;
      if (
        pointer.x < camera.x || pointer.x > camera.x + camera.width ||
        pointer.y < camera.y || pointer.y > camera.y + camera.height
      ) {
        this.isDragging = false;
      } else {
        if (this.isDragging) {
          const deltaX = this.dragPosition.x - pointer.x;
          const deltaY = this.dragPosition.y - pointer.y;
          this.cameras.main.scrollX += deltaX;
          this.cameras.main.scrollY += deltaY;
          this.dragPosition.set(pointer.x, pointer.y);
        }
      }
    }
  }

  private handleMouseUp(pointer: Phaser.Input.Pointer) {
    if (pointer.middleButtonReleased()) {
      this.isDragging = false;
    }
  }

  private handleMouseWheel(pointer: Phaser.Input.Pointer, gameObjects: any[], deltaX: number, deltaY: number, deltaZ: number) {
    const camera = this.cameras.main;
    if (
      pointer.x < camera.x || pointer.x > camera.x + camera.width ||
      pointer.y < camera.y || pointer.y > camera.y + camera.height
    ) {
      return;
    }

    let newZoom = this.cameras.main.zoom - deltaY * 0.001; // change this to smaller value for smoother zoom

    const maxZoomX = this.cameras.main.width / this.worldBounds.x;
    const maxZoomY = this.cameras.main.height / this.worldBounds.y;
    const maxZoom = Math.max(maxZoomX, maxZoomY);

    newZoom = Phaser.Math.Clamp(newZoom, maxZoom, 3);

    this.cameras.main.zoomTo(newZoom, 200); // Use zoomTo for smoother transition
  }


  private handleResize(gameSize: Phaser.Structs.Size, baseSize: Phaser.Structs.Size, displaySize: Phaser.Structs.Size, resolution: number) {
    this.cameras.main.setViewport(this.menuWidth, 0, gameSize.width - this.menuWidth, gameSize.height);    // ...
  }

  private exportLines(): string {
    let minX: number = Number.MAX_SAFE_INTEGER;
    let minY: number = Number.MAX_SAFE_INTEGER;
    let maxX: number = Number.MIN_SAFE_INTEGER;
    let maxY: number = Number.MIN_SAFE_INTEGER;
    let deletedLines = 0;
    const playerTile = this.tiles[this.player.location.y][this.player.location.x];
    const playerLineOrig = playerTile.getLine();
    let playerLine = 0;
    if (playerLineOrig !== undefined) {

      this.lines.forEach((line, index) => {
        if (line.length === 0) {
          if (index < playerLineOrig) {
            deletedLines++;
          }
        }
        playerLine = playerLineOrig - deletedLines;
        playerLine = playerLine < 0 ? 0 : playerLine;
      });
    }

    const lines = this.lines.filter(n => n.length > 0)
    lines.forEach(line => {
      line.forEach(tile => {
        if (tile.location.x < minX) minX = tile.location.x;
        if (tile.location.y < minY) minY = tile.location.y;
        if (tile.location.x > maxX) maxX = tile.location.x;
        if (tile.location.y > maxY) maxY = tile.location.y;
      });
    });
    let padding = 2;


    let playerTileIndex = 0;
    if (playerLine !== undefined) {
      playerTileIndex = lines[playerLine].indexOf(playerTile);
      playerTileIndex = playerTileIndex < 0 ? 0 : playerTileIndex;
    }
    let output: string = `${lines.length} ${playerLine} ${playerTileIndex} D\n`;
    output += `${-padding} ${-padding} ${maxX - minX + padding} ${maxY - minY + padding}\n`;
    lines.forEach(line => {

      output += `${line.length} `;

      line.forEach((tile, index) => {
        const normalizedX = tile.location.x - minX;
        const normalizedY = tile.location.y - minY;

        const gridPosition = `${normalizedX} ${normalizedY}`;

        let direction;
        switch (tile.nextTileDirection) {
          case Direction.North:
            direction = 'U';
            break;
          case Direction.South:
            direction = 'D';
            break;
          case Direction.East:
            direction = 'R';
            break;
          case Direction.West:
            direction = 'L';
            break;
          default:
            direction = '';
            break;
        }

        const tileType = TileType[tile.type]

        // For the last tile, exclude the direction of the next tile
        if (index === 0) {
          output += `${gridPosition} ${direction}${tileType} `
        } else if (index === line.length - 1) {
          output += `${tileType}\n`;
        } else {
          output += `${direction}${tileType} `;
        }
      });
    });

    return output;
  }

  private importLines(input: string) {
    this.tiles.forEach(row => {
      row.forEach(tile => {
        this.removeAt(tile.location.x, tile.location.y);
      }
      )
    });
    this.lines.forEach(line => {
      line.forEach(tile => {
        this.removeAt(tile.location.x, tile.location.y);
      }
      )
    });
    this.tiles = [];
    this.lines = [];
    this.initTileMap();
    let inputLines = input.replace(/(\r)/gm, "").split('\n');
    let numberOfLines = parseInt(inputLines[0]);
    let [minX, minY, maxX, maxY] = inputLines[1].split(' ');
    let minXnum = 50 - Number(minX);
    let minYnum = 50 - Number(minY);
    for (let i = 1; i <= numberOfLines + 1; i++) {
      this.lines.push([])
      this.isDrawing = true;
      if (i < 2) continue; // skip the camera position line
      let lineData = inputLines[i].split(' ');
      let numberOfTiles = parseInt(lineData[0]);
      let x = parseInt(lineData[1]) + minXnum; // normalize x
      let y = parseInt(lineData[2]) + minYnum; // normalize y

      for (let j = 3; j < 3 + numberOfTiles; j++) {
        let tileData = lineData[j];
        let type = tileData.slice(-1);
        if (tileData.length == 1) {
          type = tileData[0]
        }

        let tile = new Tile(TileType[type as keyof typeof TileType], { x, y }, i);
        this.placeAt(x, y, TileType[type as keyof typeof TileType]);
        if (tileData.length == 2) {
          switch (tileData.slice(0, -1)) {
            case 'U':
              y--;
              break;
            case 'D':
              if(j==3) {
              this.addToBeginning = true;
              }
              y++;
              break;
            case 'R':
              x++;
              break;
            case 'L':
              if(j==3) {
                this.addToBeginning = true;
                }
              x--;
              break;
          }
        }

        this.lines[i - 2].push(tile);
      }
      this.addToBeginning = false;
      this.isDrawing = false;
    }
  }
}
