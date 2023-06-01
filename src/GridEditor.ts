import { SpriteLoader } from "./SpriteLoader.js";
import eventsCenter from "./EventsCenter.js";
import { TileType, Tile } from "./Tile.js";
import { GridCameraHandler } from "./GridCameraHandler.js";
import { GridState } from "./GridState.js";
import { GridTool } from "./grid-tools/GridTool.js";
import { RemoveTileTool } from "./grid-tools/RemoveTileTool.js";
import { PlayerPlaceTool } from "./grid-tools/PlayerPlaceTool.js";
import { TilePlaceTool } from "./grid-tools/TilePlaceTool.js";
import { GridMouseGestureHandler } from "./GridMouseGesture.js";

export class GridEditor extends Phaser.Scene {
  public static readonly tileSize: number = 28;
  private static readonly menuWidth: number = 385;

  private gridCameraHandler = new GridCameraHandler();

  private gridState = new GridState(this.add);
  public isDrawing: boolean = false;

  private worldBounds: Phaser.Math.Vector2;
  private spriteLoader: SpriteLoader;
  private selectedTool: GridTool | undefined;
  private gridGestureHandler = new GridMouseGestureHandler();

  constructor() {
    super({ key: 'GridEditor' });
    this.worldBounds = new Phaser.Math.Vector2(
      GridState.gridTileSize.width * GridEditor.tileSize,
      GridState.gridTileSize.height * GridEditor.tileSize
    );
    this.spriteLoader = new SpriteLoader();
  }

  preload() {
    this.initTileMap();
    this.spriteLoader.preloadSprites(this);
  }

  create() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.handleMouseDown(pointer));
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => this.handleMouseMove(pointer));
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => this.handleMouseUp(pointer));
    this.input.on('wheel', this.handleMouseWheel, this);
    this.scale.on('resize', this.handleResize, this);

    // this.input.keyboard?.on('keydown-C', async () => {
    //   const textToCopy = this.exportLines();
    //   try {
    //     await navigator.clipboard.writeText(textToCopy);
    //   } catch (err) {
    //     console.error('Error in copying text: ', err);
    //   }
    // });


    // this.input.keyboard?.on('keydown-V', async () => {
    //   try {
    //     const readText = await navigator.clipboard.readText();
    //     this.importLines(readText);
    //   } catch (err) {
    //     console.error('Error in copying text: ', err);
    //   }
    // });

    eventsCenter.on('update-tool', this.updateTool, this);
    this.add.grid(
      0,
      0,
      this.worldBounds.x,
      this.worldBounds.y,
      GridEditor.tileSize,
      GridEditor.tileSize,
      0x1a1a1a,
    ).setOrigin(0); // Set grid's origin to the top-left corner
    
    this.gridState.setObjectFactory(this.add);
    this.gridCameraHandler.initCamera(this.cameras, GridEditor.menuWidth, this.worldBounds, this.scale);
    this.gridGestureHandler.onStartGesture(gesture => this.selectedTool?.onStartGestureCallback(gesture, this.gridState));
    this.gridGestureHandler.onMoveGesture(gesture => this.selectedTool?.onMoveGestureCallback(gesture, this.gridState));
  }

  private initTileMap() {
    for (let y = 0; y < GridState.gridTileSize.height; y++) {
      let row: Tile[] = [];
      for (let x = 0; x < GridState.gridTileSize.width; x++) {
        let tile = new Tile(TileType.None, { x: x, y: y });
        tile.setSprite(undefined);
        row.push(tile);
      }
      this.gridState.tiles.push(row);
    }
  }

  private updateTool(tool: TileType) {
    if(tool === TileType.Trash) {
      this.selectedTool = new RemoveTileTool();
    } else if(tool === TileType.Player) {
      this.selectedTool = new PlayerPlaceTool();
    } else if(tool === TileType.None) {
      this.selectedTool = undefined;
    } else {
      this.selectedTool = new TilePlaceTool(tool);
    }
  }

  private handleMouseWheel(pointer: Phaser.Input.Pointer, gameObjects: any[], deltaX: number, deltaY: number, deltaZ: number) {
    this.gridCameraHandler.handleMouseWheel(this.cameras, pointer, deltaY, this.worldBounds);
  }

  private handleResize(gameSize: Phaser.Structs.Size) {
    this.cameras.main.setViewport(GridEditor.menuWidth, 0, gameSize.width - GridEditor.menuWidth, gameSize.height);
  }

  private handleMouseDown(pointer: Phaser.Input.Pointer) {
    if(this.isPointerOutOfCameraBounds(this.cameras, pointer)) { return; }
    this.gridCameraHandler.handleMouseDown(this.cameras, pointer);
    this.gridGestureHandler.handleMouseDown(pointer, this.cameras);
  }

  private handleMouseMove(pointer: Phaser.Input.Pointer) {
    if(this.isPointerOutOfCameraBounds(this.cameras, pointer)) { return; }
    this.gridCameraHandler.handleMouseMove(this.cameras, pointer);
    this.gridGestureHandler.handleMouseMove(pointer, this.cameras);
  }

  private handleMouseUp(pointer: Phaser.Input.Pointer) {
    if(this.isPointerOutOfCameraBounds(this.cameras, pointer)) { return; }
    this.gridCameraHandler.handleMouseUp(pointer);
    this.gridGestureHandler.handleMouseUp(pointer);
  }
  
  private isPointerOutOfCameraBounds(camera: Phaser.Cameras.Scene2D.CameraManager, pointer: Phaser.Input.Pointer): boolean {
    return pointer.x < camera.main.x || pointer.x > camera.main.x + camera.main.width ||
      pointer.y < camera.main.y || pointer.y > camera.main.y + camera.main.height;
  }
/*
  private exportLines(): string {
    let minX: number = Number.MAX_SAFE_INTEGER;
    let minY: number = Number.MAX_SAFE_INTEGER;
    let maxX: number = Number.MIN_SAFE_INTEGER;
    let maxY: number = Number.MIN_SAFE_INTEGER;
    let deletedLines = 0;
    const playerTile = this.gridState.tiles[this.gridState.player.location.y][this.gridState.player.location.x];
    const playerLineOrig = playerTile.getLine();
    let playerLine = 0;
    if (playerLineOrig !== undefined) {

      this.gridState.lines.forEach((line, index) => {
        if (line.length === 0) {
          if (index < playerLineOrig) {
            deletedLines++;
          }
        }
        playerLine = playerLineOrig - deletedLines;
        playerLine = playerLine < 0 ? 0 : playerLine;
      });
    }

    const lines = this.gridState.lines.filter(n => n.length > 0)
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

        const tileType = tile.type;

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
    this.gridState.tiles.forEach(row => {
      row.forEach(tile => {
        this.removeAt(tile.location.x, tile.location.y);
      }
      )
    });
    this.gridState.lines.forEach(line => {
      line.forEach(tile => {
        this.removeAt(tile.location.x, tile.location.y);
      }
      )
    });
    this.gridState.tiles = [];
    this.gridState.lines = [];
    this.initTileMap();
    let inputLines = input.replace(/(\r)/gm, "").split('\n');
    let numberOfLines = parseInt(inputLines[0]);
    let [minX, minY, maxX, maxY] = inputLines[1].split(' ');
    let minXnum = 50 - Number(minX);
    let minYnum = 50 - Number(minY);
    for (let i = 1; i <= numberOfLines + 1; i++) {
      this.gridState.lines.push([])
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
              if (j == 3) {
                this.addToBeginning = true;
              }
              y++;
              break;
            case 'R':
              x++;
              break;
            case 'L':
              if (j == 3) {
                this.addToBeginning = true;
              }
              x--;
              break;
          }
        }

        this.gridState.lines[i - 2].push(tile);
      }
      this.addToBeginning = false;
      this.isDrawing = false;
    }
  }*/
}
