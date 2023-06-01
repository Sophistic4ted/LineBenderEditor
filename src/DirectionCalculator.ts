import { GridPosition } from "./GridPosition.js";
import { Direction } from "./Tile.js";


export class DirectionCalculator {
  public static makeOpposite(direction: Direction): Direction {
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

  public static getDirection(from: GridPosition, to: GridPosition): Direction | undefined {
    if (from.x === to.x) {
      return from.y < to.y ? Direction.South : Direction.North;
    }
    if (from.y === to.y) {
      return from.x < to.x ? Direction.East : Direction.West;
    }
    return undefined;
  }

  public static addDirection(position: GridPosition, direction: Direction): GridPosition {
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
}