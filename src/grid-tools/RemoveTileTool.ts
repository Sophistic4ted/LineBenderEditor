import { GridMouseStartGesture, GridMouseMoveGesture } from "../GridMouseGesture.js";
import { GridState } from "../GridState.js";
import { GridTool } from "./GridTool.js";


export class RemoveTileTool implements GridTool {
    public onStartGestureCallback(gesture: GridMouseStartGesture, gridState: GridState): void {
        gridState.removeTileAt(gesture.getPosition());
    }

    public onMoveGestureCallback(gesture: GridMouseMoveGesture, gridState: GridState): void {
        gridState.removeTileAt(gesture.getStartPosition());
        gridState.removeTileAt(gesture.getEndPosition());
    }
    
}