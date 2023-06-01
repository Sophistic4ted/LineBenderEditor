export class BenderPlaceTool {
    onStartGestureCallback(gesture, gridState) {
        gridState.placeBender(gesture.getPosition());
    }
    onMoveGestureCallback(gesture, gridState) {
        gridState.placeBender(gesture.getEndPosition());
    }
}
