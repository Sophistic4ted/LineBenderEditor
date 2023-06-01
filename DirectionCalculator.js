import { Direction } from "./Tile.js";
export class DirectionCalculator {
    static makeOpposite(direction) {
        switch (direction) {
            case Direction.North:
                return Direction.South;
            case Direction.South:
                return Direction.North;
            case Direction.East:
                return Direction.West;
            default:
                return Direction.East;
        }
    }
    static getDirection(from, to) {
        if (from.x === to.x) {
            return from.y < to.y ? Direction.South : Direction.North;
        }
        if (from.y === to.y) {
            return from.x < to.x ? Direction.East : Direction.West;
        }
        return undefined;
    }
    static addDirection(position, direction) {
        switch (direction) {
            case Direction.North:
                return { x: position.x, y: position.y - 1 };
            case Direction.South:
                return { x: position.x, y: position.y + 1 };
            case Direction.East:
                return { x: position.x + 1, y: position.y };
            default:
                return { x: position.x - 1, y: position.y };
        }
    }
    static fromString(character) {
        switch (character) {
            case "U":
                return Direction.North;
            case "D":
                return Direction.South;
            case "R":
                return Direction.East;
            default:
                return Direction.West;
        }
    }
}
