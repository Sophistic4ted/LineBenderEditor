import { GridMouseStartGesture, GridMouseMoveGesture } from "../GridMouseGesture.js";
import { GridState } from "../GridState.js";
import { GridTool } from "./GridTool.js";


export class BenderPlaceTool implements GridTool {
    public onStartGestureCallback(gesture: GridMouseStartGesture, gridState: GridState): void {
        gridState.placeBender(gesture.getPosition());
    }

    public onMoveGestureCallback(gesture: GridMouseMoveGesture, gridState: GridState): void {
        gridState.placeBender(gesture.getEndPosition());
    }
}