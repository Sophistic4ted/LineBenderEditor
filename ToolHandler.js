import { TileType } from "./Tile.js";
export class ToolHandler {
    currentTool = TileType.None;
    gridEditor;
    constructor(gridEditor) {
        this.gridEditor = gridEditor;
    }
    setTool(tool) {
        this.currentTool = tool;
    }
    handlePointerDown(pointer) {
        console.log(this.gridEditor.lineCounter);
        if (pointer.leftButtonDown() && this.isInBounds(this.gridEditor.cameras.main, pointer)) {
            this.useTool(pointer, true);
        }
    }
    handlePointerMove(pointer) {
        if (!this.gridEditor.isDrawing)
            return;
        if (pointer.leftButtonDown() && this.isInBounds(this.gridEditor.cameras.main, pointer) && this.currentTool !== TileType.None) {
            console.log(this.gridEditor.isDrawing);
            this.useTool(pointer);
        }
    }
    handlePointerUp(pointer) {
        if (pointer.leftButtonReleased() && this.isInBounds(this.gridEditor.cameras.main, pointer) && this.currentTool !== TileType.None) {
            if (this.gridEditor.incrementLines) {
                this.gridEditor.lineCounter++;
            }
            this.gridEditor.incrementLines = true;
            this.gridEditor.isDrawing = false;
            this.gridEditor.tempLine = undefined;
        }
        console.log(this.gridEditor.lineCounter);
    }
    useTool(pointer, isStart = false) {
        const camera = this.gridEditor.cameras.main;
        if (pointer.x < camera.x || pointer.x > camera.x + camera.width || pointer.y < camera.y || pointer.y > camera.y + camera.height) {
            return;
        }
        const worldPoint = pointer.positionToCamera(camera);
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
        }
    }
    isInBounds(camera, pointer) {
        return pointer.x > camera.x && pointer.x < camera.x + camera.width && pointer.y > camera.y && pointer.y < camera.y + camera.height;
    }
}
