import { SpriteLoader } from "./SpriteLoader.js";
import { TileSelector } from "./TileSelector.js";
import eventsCenter from "./EventsCenter.js";
import { TileType, Tile } from "./Tile.js";
import { ToolHandler } from "./ToolHandler.js";

export class GridEditor extends Phaser.Scene {
  public tileSize: number = 28;
  public menuWidth: number = 385;

  private gridTileSize: { width: number; height: number } = { width: 10, height: 10 };
  private isDragging: boolean = false;
  public isDrawing: boolean = false;

  private dragPosition: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
  private worldBounds: { x: number; y: number };
  private spriteLoader: SpriteLoader;
  private tiles: Tile[][] = [];
  private toolHandler: ToolHandler;
  public lineCounter: number = 0;
  public tempLine: number | undefined = undefined;
  private lines: Array<Array<Tile>> = [];

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
        let tile = new Tile(TileType.None, { x: x * this.tileSize, y: y * this.tileSize });
        tile.setSprite(undefined);
        tile.setLine(undefined);
        row.push(tile);
      }
      this.tiles.push(row);
    }
  }


  private updateTool(tool: TileType) {
    this.toolHandler.setTool(tool);
  }

  placeAt(x: number, y: number, type: TileType) {
    if (!this.isWithinBounds(x, y)) {
      console.error("Attempted to place tile out of grid bounds");
      return;
    }
    console.log(this.lines)
    const spriteFrame = this.getSpriteFrame(type)
    if (this.tiles[y][x].sprite === undefined) {
      this.processEmptyField(x, y, type, spriteFrame);
    } else {
      this.processOccupiedField(y, x, type, spriteFrame);
    }
  }

  private processOccupiedField(y: number, x: number, type: TileType, spriteFrame: number | undefined) {
    if (this.tiles[y][x].type !== type) {
      this.processFieldWithDifferentSprite(y, x, spriteFrame, type);
    } else if (this.tiles[y][x].nextTileDirection === undefined && this.isDrawing && this.tempLine === undefined) {
      this.tempLine = this.tiles[y][x].getLine();
    }
  }

  private processFieldWithDifferentSprite(y: number, x: number, spriteFrame: number | undefined, type: TileType) {
    this.tiles[y][x].sprite?.destroy(); // remove sprite from scene
    this.tiles[y][x].sprite = undefined; // remove sprite reference
    const sprite = this.add.sprite(x * this.tileSize, y * this.tileSize, 'spritesheet', spriteFrame).setOrigin(0);
    this.tiles[y][x].setType(type);
    this.tiles[y][x].sprite = sprite;
  }

  private isWithinBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.gridTileSize.width && y < this.gridTileSize.height;
  }

  private getSpriteFrame(type: TileType) {
    const spriteFrame = this.spriteLoader.getSpriteFrame(type);
    if (spriteFrame === undefined) {
      console.error("Attempted to place tile with an unregistered sprite");
    }
    return spriteFrame;
  }

  private processEmptyField(x: number, y: number, type: TileType, spriteFrame: number | undefined) {
    if (this.isDrawing) {
      const line = this.tempLine !== undefined ? this.tempLine : this.lineCounter;
      this.tiles[y][x].setLine(line);
      if (this.lines[line] === undefined) {
        this.lines.push([]);
      }
      this.lines[line].push(this.tiles[y][x]);
    }
    this.createSprite(x, y, type, spriteFrame);
  }

  private createSprite(x: number, y: number, type: TileType, spriteFrame: number | undefined) {
    const sprite = this.add.sprite(x * this.tileSize, y * this.tileSize, 'spritesheet', spriteFrame).setOrigin(0);
    this.tiles[y][x].setType(type);
    this.tiles[y][x].sprite = sprite;
  }
  removeAt(x: number, y: number) {
    if (x < 0 || y < 0 || x >= this.gridTileSize.width || y >= this.gridTileSize.height) {
      console.error("Attempted to remove tile out of grid bounds");
      return;
    }

    const lineIndex = this.tiles[y][x].getLine();
    if (lineIndex !== undefined) {
      const tileIndex = this.lines[lineIndex].indexOf(this.tiles[y][x]);
      this.lines[lineIndex].splice(tileIndex, 1);

      this.tiles[y][x].setType(TileType.None);
      console.log(this.tiles[y][x].sprite)
      this.tiles[y][x].sprite?.destroy();  // remove sprite from scene
      this.tiles[y][x].sprite = undefined;  // remove sprite reference

      if (tileIndex < this.lines[lineIndex].length) {
        const newLine = this.lines[lineIndex].splice(tileIndex);
        this.lines.push(newLine);
        newLine.forEach(tile => tile.line = this.lines.length - 1);
      }
    }
    console.log(this.lines)
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
}
