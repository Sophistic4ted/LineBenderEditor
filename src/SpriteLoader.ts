import { TileType } from "./Tile.js";

const spriteSheetUrl = "sprites_2.png";
const rowNumber = 16;
const spriteData = [
  { id: TileType.G, xIndex: 0, yIndex: 0 },
  { id: TileType.B, xIndex: 0, yIndex: 1 },
  { id: TileType.S, xIndex: 0, yIndex: 2 },
  { id: TileType.OD, xIndex: 0, yIndex: 3 },
  { id: TileType.CD, xIndex: 0, yIndex: 4 },
  { id: TileType.K, xIndex: 0, yIndex: 5 },
  { id: TileType.W, xIndex: 0, yIndex: 6 },
  { id: TileType.T, xIndex: 0, yIndex: 7 },
];

// Create a map of TileType to frame index
const spriteIndices = new Map(spriteData.map(({ id, xIndex, yIndex }) => [id, yIndex * rowNumber + xIndex]));

export class SpriteLoader {
  public tileSize = 28;

  preloadSprites(scene: Phaser.Scene): void {
    scene.load.spritesheet('spritesheet', spriteSheetUrl, {
      frameWidth: this.tileSize,
      frameHeight: this.tileSize,
      margin: 0,
      spacing: 1,
    });
  }

  getSpriteFrame(id: TileType): number | undefined{
    return spriteIndices.get(id);
  }

  getTileTypes(): TileType[] {
    return spriteData.map(data => data.id);
  }

}
