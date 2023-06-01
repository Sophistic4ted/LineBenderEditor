export class TilePlaceTool {
    tileType;
    constructor(tileType) {
        this.tileType = tileType;
    }
    onStartGestureCallback(gesture, gridState) {
        if (gridState.isPositionEmpty(gesture.getPosition())) {
            gridState.createNewLineAt(gesture.getPosition(), this.tileType);
        }
        else {
            gridState.setTileType(gesture.getPosition(), this.tileType);
        }
    }
    onMoveGestureCallback(gesture, gridState) {
        if (gridState.isPositionEmpty(gesture.getStartPosition())) {
            gridState.createNewLineAt(gesture.getStartPosition(), this.tileType);
        }
        if (gridState.isPositionEmpty(gesture.getEndPosition())) {
            gridState.createNewLineAt(gesture.getEndPosition(), this.tileType);
        }
        gridState.tryConnectingTiles(gesture.getStartPosition(), gesture.getEndPosition());
        gridState.setTileType(gesture.getStartPosition(), this.tileType);
        gridState.setTileType(gesture.getEndPosition(), this.tileType);
    }
}
