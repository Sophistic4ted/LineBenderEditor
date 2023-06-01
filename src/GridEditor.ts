import { SpriteLoader } from "./SpriteLoader.js";
import eventsCenter from "./EventsCenter.js";
import { TileType, Tile, Direction } from "./Tile.js";
import { GridCameraHandler } from "./GridCameraHandler.js";
import { GridState } from "./GridState.js";
import { GridTool } from "./grid-tools/GridTool.js";
import { RemoveTileTool } from "./grid-tools/RemoveTileTool.js";
import { BenderPlaceTool } from "./grid-tools/BenderPlaceTool.js";
import { TilePlaceTool } from "./grid-tools/TilePlaceTool.js";
import { GridMouseGestureHandler } from "./GridMouseGesture.js";
import { InputHandler } from "./InputHandler.js";
import { ClipboardManager } from "./ClipboardManager.js";

export class GridEditor extends Phaser.Scene {
  public static readonly tileSize = 28;
  public static readonly menuWidth = 385;
  private static readonly tilesLevelExportPadding = 2;

  private gridCameraHandler = new GridCameraHandler();

  private gridState = new GridState(this.add);
  public isDrawing: boolean = false;

  private worldBounds: Phaser.Math.Vector2;
  private spriteLoader: SpriteLoader;
  private selectedTool: GridTool | undefined;
  private gridGestureHandler = new GridMouseGestureHandler();
  private clipboardManager: ClipboardManager;
  constructor() {
    super({ key: 'GridEditor' });
    this.worldBounds = new Phaser.Math.Vector2(
      GridState.gridTileSize.width * GridEditor.tileSize,
      GridState.gridTileSize.height * GridEditor.tileSize
    );
    this.spriteLoader = new SpriteLoader();
    this.clipboardManager = new ClipboardManager(this.gridState);
  }

  preload() {
    this.initTileMap();
    this.spriteLoader.preloadSprites(this);
  }

  create() {
    new InputHandler(this, this.cameras, this.gridCameraHandler, this.gridGestureHandler, this.worldBounds);

    eventsCenter.on('use-tool', this.useTool, this);
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

  private useTool(tool: TileType) {

    if(tool === TileType.Copy) {
      this.clipboardManager.copyToClipboard()
    }
    if(tool === TileType.Paste) {
      this.clipboardManager.pasteFromClipboard()
    }
    if (tool === TileType.Trash) {
      this.selectedTool = new RemoveTileTool();
    } else if (tool === TileType.Bender) {
      this.selectedTool = new BenderPlaceTool();
    } else if (tool === TileType.None) {
      this.selectedTool = undefined;
    } else {
      this.selectedTool = new TilePlaceTool(tool);
    }
  }
}
