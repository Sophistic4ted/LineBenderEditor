export class PlayerPlaceTool {
    onStartGestureCallback(gesture, gridState) {
        gridState.placePlayer(gesture.getPosition());
    }
    onMoveGestureCallback(gesture, gridState) {
        gridState.placePlayer(gesture.getEndPosition());
    }
}
