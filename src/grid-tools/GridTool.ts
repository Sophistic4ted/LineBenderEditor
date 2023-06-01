import { GridMouseMoveGesture, GridMouseStartGesture } from "../GridMouseGesture.js";
import { GridState } from "../GridState.js";

export interface GridTool {
    onStartGestureCallback(gesture: GridMouseStartGesture, gridState: GridState): void;
    onMoveGestureCallback(gesture: GridMouseMoveGesture, gridState: GridState): void;
}