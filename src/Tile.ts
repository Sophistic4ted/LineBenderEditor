export enum Direction { Up, Right, Down, Left }
export enum TileType {
  Grass = 'G',
  Bricks = 'B',
  Win = 'W',
  Swamp = 'S',
  Key = 'K',
  Door = 'D',
  Hydro = 'H',
  Fire = 'F',
  LevelSwitch = 'L',
  Portal1 = '1',
  Portal2 = '2',
  Portal3 = '3',
  Trash = 'T',
  Bender = 'P',
  Copy = 'C',
  Paste = 'V',
  None = 'None'
}
export enum Direction {
  North = 'North',
  South = 'South',
  East = 'East',
  West = 'West',
}
export class Tile {

  constructor(public type: TileType,
    public location: { x: number, y: number },
    public line: number | undefined = undefined,
    public sprite?: Phaser.GameObjects.Sprite,
    public nextTileDirection?: Direction,
    public previousTileDirection?: Direction) { }

  setType(type: TileType) {
    this.type = type;
  }

  getType() {
    return this.type;
  }

  setSprite(sprite: Phaser.GameObjects.Sprite | undefined) {
    this.sprite = sprite;
  }

  setNextTileDirection(direction: Direction | undefined) {
    this.nextTileDirection = direction;
  }

  setPreviousTileDirection(direction: Direction | undefined) {
    this.previousTileDirection = direction;
  }

  setLine(line: number | undefined) {
    this.line = line;
  }

  getLine(): number | undefined {
    return this.line;
  }

  getNextTileDirection() {
    return this.nextTileDirection;
  }
  getPreviousTileDirection() {
    return this.previousTileDirection;
  }

  isEmpty(): boolean {
    return this.type === TileType.None;
  }

  switchDirections(): void {
    const tmpDirection = this.nextTileDirection;
    this.nextTileDirection = this.previousTileDirection;
    this.previousTileDirection = tmpDirection;
  }

  isOnTheBeginningOfTheLine(): boolean {
    return this.previousTileDirection === undefined;
  }

  isOnTheEndOfTheLine(): boolean {
    return this.nextTileDirection === undefined;
  }
  
  isOnOneOfTheEndsOfTheLine(): boolean {
    return this.isOnTheEndOfTheLine() || this.isOnTheBeginningOfTheLine();
  }
}

