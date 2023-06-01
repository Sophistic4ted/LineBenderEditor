import { SpriteLoader } from "./SpriteLoader.js";
import eventsCenter from "./EventsCenter.js";
import { TileType, Tile } from "./Tile.js";
import { GridCameraHandler } from "./GridCameraHandler.js";
import { GridState } from "./GridState.js";
import { RemoveTileTool } from "./grid-tools/RemoveTileTool.js";
import { PlayerPlaceTool } from "./grid-tools/PlayerPlaceTool.js";
import { TilePlaceTool } from "./grid-tools/TilePlaceTool.js";
import { GridMouseGestureHandler } from "./GridMouseGesture.js";
class GridEditor extends Phaser.Scene {
    static tileSize = 28;
    static menuWidth = 385;
    gridCameraHandler = new GridCameraHandler();
    gridState = new GridState(this.add);
    isDrawing = false;
    worldBounds;
    spriteLoader;
    selectedTool;
    gridGestureHandler = new GridMouseGestureHandler();
    constructor() {
        super({ key: 'GridEditor' });
        this.worldBounds = new Phaser.Math.Vector2(GridState.gridTileSize.width * GridEditor.tileSize, GridState.gridTileSize.height * GridEditor.tileSize);
        this.spriteLoader = new SpriteLoader();
    }
    preload() {
        this.initTileMap();
        this.spriteLoader.preloadSprites(this);
    }
    create() {
        this.input.on('pointerdown', (pointer) => this.handleMouseDown(pointer));
        this.input.on('pointermove', (pointer) => this.handleMouseMove(pointer));
        this.input.on('pointerup', (pointer) => this.handleMouseUp(pointer));
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
    updateTool(tool) {
        if (tool === TileType.Trash) {
            this.selectedTool = new RemoveTileTool();
        }
        else if (tool === TileType.Player) {
            this.selectedTool = new PlayerPlaceTool();
        }
        else if (tool === TileType.None) {
            this.selectedTool = undefined;
        }
        else {
            this.selectedTool = new TilePlaceTool(tool);
        }
    }
    handleMouseWheel(pointer, gameObjects, deltaX, deltaY, deltaZ) {
        this.gridCameraHandler.handleMouseWheel(this.cameras, pointer, deltaY, this.worldBounds);
    }
    handleResize(gameSize) {
        this.cameras.main.setViewport(GridEditor.menuWidth, 0, gameSize.width - GridEditor.menuWidth, gameSize.height);
    }
    handleMouseDown(pointer) {
        if (this.isPointerOutOfCameraBounds(this.cameras, pointer)) {
            return;
        }
        this.gridCameraHandler.handleMouseDown(this.cameras, pointer);
        this.gridGestureHandler.handleMouseDown(pointer, this.cameras);
    }
    handleMouseMove(pointer) {
        if (this.isPointerOutOfCameraBounds(this.cameras, pointer)) {
            return;
        }
        this.gridCameraHandler.handleMouseMove(this.cameras, pointer);
        this.gridGestureHandler.handleMouseMove(pointer, this.cameras);
    }
    handleMouseUp(pointer) {
        if (this.isPointerOutOfCameraBounds(this.cameras, pointer)) {
            return;
        }
        this.gridCameraHandler.handleMouseUp(pointer);
        this.gridGestureHandler.handleMouseUp(pointer);
    }
    isPointerOutOfCameraBounds(camera, pointer) {
        return pointer.x < camera.main.x || pointer.x > camera.main.x + camera.main.width ||
            pointer.y < camera.main.y || pointer.y > camera.main.y + camera.main.height;
    }
}
export { GridEditor };
