import { GridPosition } from "./GridPosition";
import { Direction } from "./Tile";

class GridMouseGesture {
    constructor(private startPosition: GridPosition, private direction: Direction) {}
    
    public getStartPosition(): GridPosition {
        return this.startPosition;
    }

    public getDirection(): Direction {
        return this.direction;
    }
}