import { DirectionCalculator } from "./DirectionCalculator.js";
import { GridEditor } from "./GridEditor.js";
import { GridPosition } from "./GridPosition.js";
export class GridMouseStartGesture {
    startPosition;
    constructor(startPosition) {
        this.startPosition = startPosition;
    }
    getPosition() {
        return this.startPosition;
    }
}
export class GridMouseMoveGesture {
    startPosition;
    direction;
    constructor(startPosition, direction) {
        this.startPosition = startPosition;
        this.direction = direction;
    }
    getStartPosition() {
        return this.startPosition;
    }
    getEndPosition() {
        return DirectionCalculator.addDirection(this.startPosition, this.direction);
    }
    getNextTileDirection() {
        return this.direction;
    }
}
export class GridMouseGestureHandler {
    dragTilePosition = new GridPosition(0, 0);
    isCurrentlyDragging = false;
    onStartGestureCallback = () => { };
    onMoveGestureCallback = () => { };
    handleMouseDown(pointer, camera) {
        if (!pointer.leftButtonDown()) {
            return;
        }
        const tilePosition = this.pointerToGridPosition(pointer, camera);
        this.isCurrentlyDragging = true;
        this.onStartGestureCallback(new GridMouseStartGesture(tilePosition));
        this.dragTilePosition = tilePosition;
    }
    handleMouseMove(pointer, camera) {
        if (!pointer.leftButtonDown()) {
            return;
        }
        if (!this.isCurrentlyDragging) {
            return;
        }
        const tilePosition = this.pointerToGridPosition(pointer, camera);
        const interpolatedPoints = this.getPointsInLine(this.dragTilePosition, tilePosition);
        this.dragTilePosition = tilePosition;
        this.emitMoveGestureForEveryPair(interpolatedPoints);
    }
    handleMouseUp(pointer) {
        if (!pointer.leftButtonReleased()) {
            return;
        }
        this.isCurrentlyDragging = false;
    }
    onStartGesture(callback) {
        this.onStartGestureCallback = callback;
    }
    onMoveGesture(callback) {
        this.onMoveGestureCallback = callback;
    }
    emitMoveGestureForEveryPair(points) {
        for (let i = 1; i < points.length; i++) {
            const gesture = this.makeGestureFrom2Points(points[i - 1], points[i]);
            if (!gesture) {
                return;
            }
            this.onMoveGestureCallback(gesture);
        }
    }
    pointerToGridPosition(pointer, camera) {
        const worldPosition = pointer.positionToCamera(camera.main);
        const tileX = Math.floor(worldPosition.x / GridEditor.tileSize);
        const tileY = Math.floor(worldPosition.y / GridEditor.tileSize);
        return new GridPosition(tileX, tileY);
    }
    getPointsInLine(p0, p1) {
        let dx = p1.x - p0.x, dy = p1.y - p0.y;
        let nx = Math.abs(dx), ny = Math.abs(dy);
        let signX = dx > 0 ? 1 : -1;
        let signY = dy > 0 ? 1 : -1;
        let p = new GridPosition(p0.x, p0.y);
        let points = [new GridPosition(p.x, p.y)];
        for (let ix = 0, iy = 0; ix < nx || iy < ny;) {
            if ((0.5 + ix) * ny < (0.5 + iy) * nx) {
                // next step is horizontal
                p.x += signX;
                ix++;
            }
            else {
                // next step is vertical
                p.y += signY;
                iy++;
            }
            points.push(new GridPosition(p.x, p.y));
        }
        return points;
    }
    makeGestureFrom2Points(from, to) {
        const direction = DirectionCalculator.getDirection(from, to);
        if (!direction) {
            return undefined;
        }
        return new GridMouseMoveGesture(from, direction);
    }
}
