import { GridMouseStartGesture, GridMouseMoveGesture } from "../GridMouseGesture.js";
import { GridState } from "../GridState.js";
import { GridTool } from "./GridTool.js";


export class PlayerPlaceTool implements GridTool {
    public onStartGestureCallback(gesture: GridMouseStartGesture, gridState: GridState): void {
        gridState.placePlayer(gesture.getPosition());
    }

    public onMoveGestureCallback(gesture: GridMouseMoveGesture, gridState: GridState): void {
        gridState.placePlayer(gesture.getEndPosition());
    }
    
}