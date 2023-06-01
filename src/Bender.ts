import { Direction } from "./Tile.js";

export class Bender {
  constructor(public location: { x: number; y: number; } = { x: 0, y: 0 },
    public sprite: Phaser.GameObjects.Sprite | undefined,
    public direction?: Direction) { }
}