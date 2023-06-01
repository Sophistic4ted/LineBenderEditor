import { SpriteLoader } from "./SpriteLoader.js";
import eventsCenter from "./EventsCenter.js";
import { TileType, Tile } from "./Tile.js";
import { GridCameraHandler } from "./GridCameraHandler.js";
import { GridState } from "./GridState.js";
import { RemoveTileTool } from "./grid-tools/RemoveTileTool.js";
import { BenderPlaceTool } from "./grid-tools/BenderPlaceTool.js";
import { TilePlaceTool } from "./grid-tools/TilePlaceTool.js";
import { GridMouseGestureHandler } from "./GridMouseGesture.js";
import { InputHandler } from "./InputHandler.js";
import { ClipboardManager } from "./ClipboardManager.js";
class GridEditor extends Phaser.Scene {
    static tileSize = 28;
    static menuWidth = 385;
    static tilesLevelExportPadding = 2;
    gridCameraHandler = new GridCameraHandler();
    gridState = new GridState(this.add);
    isDrawing = false;
    worldBounds;
    spriteLoader;
    selectedTool;
    gridGestureHandler = new GridMouseGestureHandler();
    clipboardManager;
    constructor() {
        super({ key: 'GridEditor' });
        this.worldBounds = new Phaser.Math.Vector2(GridState.gridTileSize.width * GridEditor.tileSize, GridState.gridTileSize.height * GridEditor.tileSize);
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
        this.add.grid(0, 0, this.worldBounds.x, this.worldBounds.y, GridEditor.tileSize, GridEditor.tileSize, 0x1a1a1a).setOrigin(0); // Set grid's origin to the top-left corner
        this.gridState.setObjectFactory(this.add);
        this.gridCameraHandler.initCamera(this.cameras, GridEditor.menuWidth, this.worldBounds, this.scale);
        this.gridGestureHandler.onStartGesture(gesture => this.selectedTool?.onStartGestureCallback(gesture, this.gridState));
        this.gridGestureHandler.onMoveGesture(gesture => this.selectedTool?.onMoveGestureCallback(gesture, this.gridState));
    }
    initTileMap() {
        for (let y = 0; y < GridState.gridTileSize.height; y++) {
            let row = [];
            for (let x = 0; x < GridState.gridTileSize.width; x++) {
                let tile = new Tile(TileType.None, { x: x, y: y });
                tile.setSprite(undefined);
                row.push(tile);
            }
            this.gridState.tiles.push(row);
        }
    }
    useTool(tool) {
        if (tool === TileType.Copy) {
            this.clipboardManager.copyToClipboard();
        }
        if (tool === TileType.Paste) {
            this.clipboardManager.pasteFromClipboard();
        }
        if (tool === TileType.Trash) {
            this.selectedTool = new RemoveTileTool();
        }
        else if (tool === TileType.Bender) {
            this.selectedTool = new BenderPlaceTool();
        }
        else if (tool === TileType.None) {
            this.selectedTool = undefined;
        }
        else {
            this.selectedTool = new TilePlaceTool(tool);
        }
    }
}
export { GridEditor };
