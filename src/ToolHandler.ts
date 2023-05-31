import { TileType } from "./Tile.js";
import { GridEditor } from "./GridEditor.js";

export class ToolHandler {
    private currentTool: TileType = TileType.None
    private gridEditor: GridEditor;

    constructor(gridEditor: GridEditor) {
        this.gridEditor = gridEditor;
    }

    setTool(tool: TileType) {
        this.currentTool = tool;
    }

    public handlePointerDown(pointer: Phaser.Input.Pointer) {
        if (pointer.leftButtonDown() && this.isInBounds(this.gridEditor.cameras.main, pointer)) {
            this.useTool(pointer, true);
        }
    }

    public handlePointerMove(pointer: Phaser.Input.Pointer) {
        if (this.gridEditor.isDrawing && pointer.leftButtonDown() && this.isInBounds(this.gridEditor.cameras.main, pointer) && this.currentTool !== TileType.Trash) {
            this.useTool(pointer);
        } else if (pointer.leftButtonDown() && this.currentTool === TileType.Trash) {
            this.useTool(pointer);
        }
    }

    public handlePointerUp(pointer: Phaser.Input.Pointer) {
        if (pointer.leftButtonReleased() && this.isInBounds(this.gridEditor.cameras.main, pointer) && this.currentTool !== TileType.None) {
            this.gridEditor.isDrawing = false;
            this.gridEditor.tempLineNumber = undefined;
            this.gridEditor.addToBeginning = false;
        }
    }

    private useTool(pointer: Phaser.Input.Pointer, isStart = false) {
        const camera = this.gridEditor.cameras.main;

        if (pointer.x < camera.x || pointer.x > camera.x + camera.width || pointer.y < camera.y || pointer.y > camera.y + camera.height) {
            return;
        }

        const worldPoint = pointer.positionToCamera(camera) as Phaser.Math.Vector2;

        const x = Math.floor(worldPoint.x / GridEditor.tileSize);
        const y = Math.floor(worldPoint.y / GridEditor.tileSize);
        switch (this.currentTool) {
            case TileType.Grass:
            case TileType.Bricks:
            case TileType.Win:
            case TileType.Swamp:
            case TileType.Key:
            case TileType.Door:
                this.gridEditor.isDrawing = true;
                this.gridEditor.placeAt(x, y, this.currentTool, isStart);
                break;
            case TileType.Trash:
                this.gridEditor.removeAt(x, y);
                break;
            case TileType.Player:
                this.gridEditor.removePlayer();
                this.gridEditor.placePlayer(x, y);
                break;

        }
    }

    private isInBounds(camera: Phaser.Cameras.Scene2D.Camera, pointer: Phaser.Input.Pointer) {
        return pointer.x > camera.x && pointer.x < camera.x + camera.width && pointer.y > camera.y && pointer.y < camera.y + camera.height;
    }
}
