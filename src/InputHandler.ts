import { DataTransferHandler } from "./DataTransferHandler.js";
import { GridCameraHandler } from "./GridCameraHandler.js";
import { GridEditor } from "./GridEditor.js";
import { GridMouseGestureHandler } from "./GridMouseGesture.js";
import { TileType } from "./Tile.js";
import eventsCenter from "./EventsCenter.js";
import { TileSelector } from "./TileSelector.js";

export class InputHandler {
    constructor(private scene: Phaser.Scene, private cameraManager: Phaser.Cameras.Scene2D.CameraManager,
        private gridCameraHandler: GridCameraHandler, private gridGestureHandler: GridMouseGestureHandler,
        private worldBounds: Phaser.Math.Vector2) {
        this.scene.input.on('pointerdown', this.handleMouseDown.bind(this));
        this.scene.input.on('pointermove', this.handleMouseMove.bind(this));
        this.scene.input.on('pointerup', this.handleMouseUp.bind(this));
        this.scene.input.on('wheel', this.handleMouseWheel.bind(this));
        this.scene.scale.on('resize', this.handleResize.bind(this));

        this.generateTileSelectorListeners();
    }

    private generateTileSelectorListeners() {
        Object.values(TileType).forEach(value => {
            this.scene.input.keyboard?.on(`keydown-${value}`, () => {
                eventsCenter.emit('use-tool', value)
            })
        });
    }

    private handleMouseWheel(pointer: Phaser.Input.Pointer, gameObjects: any[], deltaX: number, deltaY: number, deltaZ: number) {
        this.gridCameraHandler.handleMouseWheel(pointer, this.cameraManager, deltaY, this.worldBounds);
    }

    private handleResize(gameSize: Phaser.Structs.Size) {
        this.cameraManager.main.setViewport(GridEditor.menuWidth, 0, gameSize.width - GridEditor.menuWidth, gameSize.height);
    }

    private handleMouseDown(pointer: Phaser.Input.Pointer) {
        if (this.isPointerOutOfCameraBounds(pointer)) { return; }
        this.gridCameraHandler.handleMouseDown(pointer, this.cameraManager);
        this.gridGestureHandler.handleMouseDown(pointer, this.cameraManager);
    }

    private handleMouseMove(pointer: Phaser.Input.Pointer) {
        if (this.isPointerOutOfCameraBounds(pointer)) { return; }
        this.gridCameraHandler.handleMouseMove(pointer, this.cameraManager);
        this.gridGestureHandler.handleMouseMove(pointer, this.cameraManager);
    }

    private handleMouseUp(pointer: Phaser.Input.Pointer) {
        if (this.isPointerOutOfCameraBounds(pointer)) { return; }
        this.gridCameraHandler.handleMouseUp(pointer);
        this.gridGestureHandler.handleMouseUp(pointer);
    }

    private isPointerOutOfCameraBounds(pointer: Phaser.Input.Pointer): boolean {
        return pointer.x < this.cameraManager.main.x || pointer.x > this.cameraManager.main.x + this.cameraManager.main.width ||
            pointer.y < this.cameraManager.main.y || pointer.y > this.cameraManager.main.y + this.cameraManager.main.height;
    }
}
