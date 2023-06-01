import { GridEditor } from "./GridEditor.js";
import { TileType } from "./Tile.js";
import eventsCenter from "./EventsCenter.js";
export class InputHandler {
    scene;
    cameraManager;
    gridCameraHandler;
    gridGestureHandler;
    worldBounds;
    constructor(scene, cameraManager, gridCameraHandler, gridGestureHandler, worldBounds) {
        this.scene = scene;
        this.cameraManager = cameraManager;
        this.gridCameraHandler = gridCameraHandler;
        this.gridGestureHandler = gridGestureHandler;
        this.worldBounds = worldBounds;
        this.scene.input.on('pointerdown', this.handleMouseDown.bind(this));
        this.scene.input.on('pointermove', this.handleMouseMove.bind(this));
        this.scene.input.on('pointerup', this.handleMouseUp.bind(this));
        this.scene.input.on('wheel', this.handleMouseWheel.bind(this));
        this.scene.scale.on('resize', this.handleResize.bind(this));
        this.generateTileSelectorListeners();
    }
    generateTileSelectorListeners() {
        Object.values(TileType).forEach(value => {
            this.scene.input.keyboard?.on(`keydown-${value}`, () => {
                eventsCenter.emit('use-tool', value);
            });
        });
    }
    handleMouseWheel(pointer, gameObjects, deltaX, deltaY, deltaZ) {
        this.gridCameraHandler.handleMouseWheel(pointer, this.cameraManager, deltaY, this.worldBounds);
    }
    handleResize(gameSize) {
        this.cameraManager.main.setViewport(GridEditor.menuWidth, 0, gameSize.width - GridEditor.menuWidth, gameSize.height);
    }
    handleMouseDown(pointer) {
        if (this.isPointerOutOfCameraBounds(pointer)) {
            return;
        }
        this.gridCameraHandler.handleMouseDown(pointer, this.cameraManager);
        this.gridGestureHandler.handleMouseDown(pointer, this.cameraManager);
    }
    handleMouseMove(pointer) {
        if (this.isPointerOutOfCameraBounds(pointer)) {
            return;
        }
        this.gridCameraHandler.handleMouseMove(pointer, this.cameraManager);
        this.gridGestureHandler.handleMouseMove(pointer, this.cameraManager);
    }
    handleMouseUp(pointer) {
        if (this.isPointerOutOfCameraBounds(pointer)) {
            return;
        }
        this.gridCameraHandler.handleMouseUp(pointer);
        this.gridGestureHandler.handleMouseUp(pointer);
    }
    isPointerOutOfCameraBounds(pointer) {
        return pointer.x < this.cameraManager.main.x || pointer.x > this.cameraManager.main.x + this.cameraManager.main.width ||
            pointer.y < this.cameraManager.main.y || pointer.y > this.cameraManager.main.y + this.cameraManager.main.height;
    }
}
