import { DirectionCalculator } from "./DirectionCalculator.js";
import { GridEditor } from "./GridEditor.js";
import { GridPosition } from "./GridPosition.js";
import { Direction } from "./Tile.js";

type Camera = Phaser.Cameras.Scene2D.CameraManager;

export class GridMouseStartGesture {
    constructor(private startPosition: GridPosition) {}
    
    public getPosition(): GridPosition {
        return this.startPosition;
    }
}

export class GridMouseMoveGesture {
    constructor(private startPosition: GridPosition, private direction: Direction) {}
    
    public getStartPosition(): GridPosition {
        return this.startPosition;
    }

    public getEndPosition(): GridPosition {
        return DirectionCalculator.addDirection(this.startPosition, this.direction);
    }

    public getNextTileDirection(): Direction {
        return this.direction;
    }
}

export class GridMouseGestureHandler {
    private dragTilePosition = new GridPosition(0, 0);
    private isCurrentlyDragging = false;
    private onStartGestureCallback: (gesture: GridMouseStartGesture) => void = () => {};
    private onMoveGestureCallback: (gesture: GridMouseMoveGesture) => void = () => {};

    public handleMouseDown(pointer: Phaser.Input.Pointer, camera: Camera) {
        if (!pointer.leftButtonDown()) { return; }
        const tilePosition = this.pointerToGridPosition(pointer, camera);
        this.isCurrentlyDragging = true;
        this.onStartGestureCallback(new GridMouseStartGesture(tilePosition));
        this.dragTilePosition = tilePosition;
    }
  
    public handleMouseMove(pointer: Phaser.Input.Pointer, camera: Camera) {
        if (!pointer.leftButtonDown()) { return; }
        if(!this.isCurrentlyDragging) { return; }
        const tilePosition = this.pointerToGridPosition(pointer, camera);
        const interpolatedPoints = this.getPointsInLine(this.dragTilePosition, tilePosition);
        this.dragTilePosition = tilePosition;
        this.emitMoveGestureForEveryPair(interpolatedPoints);
    }
  
    public handleMouseUp(pointer: Phaser.Input.Pointer) {
        if (!pointer.leftButtonReleased()) { return; }
        this.isCurrentlyDragging = false;
    }

    public onStartGesture(callback: (gesture: GridMouseStartGesture) => void) {
        this.onStartGestureCallback = callback;
    }

    public onMoveGesture(callback: (gesture: GridMouseMoveGesture) => void) {
        this.onMoveGestureCallback = callback;
    }

    private emitMoveGestureForEveryPair(points: GridPosition[]): void {
        for(let i = 1; i < points.length; i++) {
            const gesture = this.makeGestureFrom2Points(points[i - 1], points[i]);
            if(!gesture) { return; }
            this.onMoveGestureCallback(gesture);
        }
    }

    private pointerToGridPosition(pointer: Phaser.Input.Pointer, camera: Camera): GridPosition {
        const worldPosition = pointer.positionToCamera(camera.main) as Phaser.Math.Vector2;
        const tileX = Math.floor(worldPosition.x / GridEditor.tileSize);
        const tileY = Math.floor(worldPosition.y / GridEditor.tileSize);
        return new GridPosition(tileX, tileY);
    }

    private getPointsInLine(p0: GridPosition, p1: GridPosition): GridPosition[] {
        let dx = p1.x-p0.x, dy = p1.y-p0.y;
        let nx = Math.abs(dx), ny = Math.abs(dy);
        let signX = dx > 0 ? 1 : -1;
        let signY = dy > 0? 1 : -1;
    
        let p = new GridPosition(p0.x, p0.y);
        let points = [new GridPosition(p.x, p.y)];
        for (let ix = 0, iy = 0; ix < nx || iy < ny;) {
            if ((0.5+ix) * ny < (0.5+iy) * nx) {
                // next step is horizontal
                p.x += signX;
                ix++;
            } else {
                // next step is vertical
                p.y += signY;
                iy++;
            }
            points.push(new GridPosition(p.x, p.y));
        }
        return points;
    }

    private makeGestureFrom2Points(from: GridPosition, to: GridPosition): GridMouseMoveGesture | undefined {
        const direction = DirectionCalculator.getDirection(from, to);
        if(!direction) { return undefined; }
        return new GridMouseMoveGesture(from, direction);
    }
  }