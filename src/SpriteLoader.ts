const spriteSheetUrl = "sprites_editor.png";
const rowNumber = 14;
const spriteData = [
  { id: "G", xIndex: 0, yIndex: 0 },
  { id: "GWN", xIndex: 2, yIndex: 0 },
  { id: "GUU", xIndex: 6, yIndex: 0 },
  { id: "GUN", xIndex: 7, yIndex: 0 },

  { id: "B", xIndex: 0, yIndex: 1 },
  { id: "BWN", xIndex: 2, yIndex: 1 },
  { id: "BUU", xIndex: 6, yIndex: 1 },
  { id: "BUN", xIndex: 7, yIndex: 1 },

  { id: "S", xIndex: 0, yIndex: 2 },
  { id: "SWN", xIndex: 2, yIndex: 2 },
  { id: "SUU", xIndex: 6, yIndex: 2 },
  { id: "SUN", xIndex: 7, yIndex: 2 },

  { id: "D", xIndex: 0, yIndex: 11 },
  { id: "DWN", xIndex: 2, yIndex: 11 },
  { id: "DUU", xIndex: 6, yIndex: 11 },
  { id: "DUN", xIndex: 7, yIndex: 11 },

  { id: "K", xIndex: 0, yIndex: 8 },
  { id: "KWN", xIndex: 2, yIndex: 8 },
  { id: "KUU", xIndex: 6, yIndex: 8 },
  { id: "KUN", xIndex: 7, yIndex: 8 },

  { id: "W", xIndex: 0, yIndex: 9 },
  { id: "WWN", xIndex: 2, yIndex: 9 },
  { id: "WUU", xIndex: 6, yIndex: 9 },
  { id: "WUN", xIndex: 7, yIndex: 9 },

  { id: "T", xIndex: 0, yIndex: 18 },
  { id: "C", xIndex: 1, yIndex: 18 },
  { id: "V", xIndex: 2, yIndex: 18 },
  { id: "P", xIndex: 11, yIndex: 1 }
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

  getSpriteFrameByTileType(id: TileType): number | undefined {
    return spriteIndices.get(id);
  }

  getSpriteFrameByName(name: string): number | undefined {
    return spriteIndices.get(name);
  }

}
