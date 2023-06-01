export class RemoveTileTool {
    onStartGestureCallback(gesture, gridState) {
        gridState.removeTileAt(gesture.getPosition());
    }
    onMoveGestureCallback(gesture, gridState) {
        gridState.removeTileAt(gesture.getStartPosition());
        gridState.removeTileAt(gesture.getEndPosition());
    }
}
