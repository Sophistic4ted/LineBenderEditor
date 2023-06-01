import { GridMouseStartGesture, GridMouseMoveGesture } from "../GridMouseGesture.js";
import { GridState } from "../GridState.js";
import { TileType } from "../Tile.js";
import { GridTool } from "./GridTool.js";


export class TilePlaceTool implements GridTool {

    constructor(private tileType: TileType) {}

    public onStartGestureCallback(gesture: GridMouseStartGesture, gridState: GridState): void {
        if(gridState.isPositionEmpty(gesture.getPosition())) {
            gridState.createNewLineAt(gesture.getPosition(), this.tileType);
        } else {
            gridState.setTileType(gesture.getPosition(), this.tileType);
        }
    }

    public onMoveGestureCallback(gesture: GridMouseMoveGesture, gridState: GridState): void {
        if(gridState.isPositionEmpty(gesture.getStartPosition())) {
            gridState.createNewLineAt(gesture.getStartPosition(), this.tileType);
        }
        if(gridState.isPositionEmpty(gesture.getEndPosition())) {
            gridState.createNewLineAt(gesture.getEndPosition(), this.tileType);
        }
        gridState.tryConnectingTiles(gesture.getStartPosition(), gesture.getEndPosition());
        gridState.setTileType(gesture.getStartPosition(), this.tileType);
        gridState.setTileType(gesture.getEndPosition(), this.tileType);
    }
    
}