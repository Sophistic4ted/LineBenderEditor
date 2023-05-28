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
        console.log('pointer down')
        if (pointer.leftButtonDown() && this.isInBounds(this.gridEditor.cameras.main, pointer) && this.currentTool !== TileType.None) {
            this.gridEditor.isDrawing = true;
            this.useTool(pointer);
        }
    }

    public handlePointerMove(pointer: Phaser.Input.Pointer) {
        console.log('pointer move')
        if (pointer.leftButtonDown() && this.isInBounds(this.gridEditor.cameras.main, pointer) && this.currentTool !== TileType.None) {
            this.useTool(pointer);
        }
    }

    public handlePointerUp(pointer: Phaser.Input.Pointer) {
        console.log('pointer up')
        if (pointer.leftButtonReleased() && this.isInBounds(this.gridEditor.cameras.main, pointer) && this.currentTool !== TileType.None) {
            console.log(this.gridEditor.isDrawing)
            if (!this.gridEditor.isDrawing && this.gridEditor.tempLine === undefined) {
                console.log('incrementing line counter' + this.gridEditor.lineCounter)
                this.gridEditor.lineCounter++
            }
            this.gridEditor.isDrawing = false;
            this.gridEditor.tempLine = undefined;
        }   
    }

    private useTool(pointer: Phaser.Input.Pointer) {
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
                this.gridEditor.placeAt(x, y, this.currentTool);
                break;
            case 'T':
                this.gridEditor.removeAt(x, y);
        }
    }

    private isInBounds(camera: Phaser.Cameras.Scene2D.Camera, pointer: Phaser.Input.Pointer) {
        return pointer.x > camera.x && pointer.x < camera.x + camera.width && pointer.y > camera.y && pointer.y < camera.y + camera.height;
    }
}
