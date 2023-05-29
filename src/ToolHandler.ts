import { TileType, Tile } from "./Tile.js";
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
        if (this.gridEditor.isDrawing && pointer.leftButtonDown() && this.isInBounds(this.gridEditor.cameras.main, pointer) && this.currentTool !== TileType.T) {
            this.useTool(pointer);
        } else if (pointer.leftButtonDown() && this.currentTool === TileType.T){
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

        const x = Math.floor(worldPoint.x / this.gridEditor.tileSize);
        const y = Math.floor(worldPoint.y / this.gridEditor.tileSize);
        switch (TileType[this.currentTool]) {
            case 'G':
            case 'B':
            case 'W':
            case 'S':
            case 'K':
            case 'OD':
            case 'CD':
                this.gridEditor.isDrawing = true;
                this.gridEditor.placeAt(x, y, this.currentTool, isStart);
                break;
            case 'T':
                this.gridEditor.removeAt(x, y);
                break;
            case 'P':
                this.gridEditor.player.location = { x, y };
                this.gridEditor.removePlayer(x, y);
                this.gridEditor.placePlayer(x, y);
                break;

        }
    }

    private isInBounds(camera: Phaser.Cameras.Scene2D.Camera, pointer: Phaser.Input.Pointer) {
        return pointer.x > camera.x && pointer.x < camera.x + camera.width && pointer.y > camera.y && pointer.y < camera.y + camera.height;
    }
}
