import { TileType } from "./Tile.js";
const spriteSheetUrl = "sprites_2.png";
const rowNumber = 16;
const spriteData = [
    { id: "G", xIndex: 0, yIndex: 0 },
    { id: "GWN", xIndex: 1, yIndex: 0 },
    { id: "GUU", xIndex: 2, yIndex: 0 },
    { id: "GUN", xIndex: 3, yIndex: 0 },
    { id: "B", xIndex: 0, yIndex: 1 },
    { id: "BWN", xIndex: 1, yIndex: 1 },
    { id: "BUU", xIndex: 2, yIndex: 1 },
    { id: "BUN", xIndex: 3, yIndex: 1 },
    { id: "S", xIndex: 0, yIndex: 2 },
    { id: "SWN", xIndex: 1, yIndex: 2 },
    { id: "SUU", xIndex: 2, yIndex: 2 },
    { id: "SUN", xIndex: 3, yIndex: 2 },
    { id: "C", xIndex: 0, yIndex: 4 },
    { id: "CWN", xIndex: 1, yIndex: 4 },
    { id: "CUU", xIndex: 2, yIndex: 4 },
    { id: "CUN", xIndex: 3, yIndex: 4 },
    { id: "K", xIndex: 0, yIndex: 5 },
    { id: "KWN", xIndex: 1, yIndex: 5 },
    { id: "KUU", xIndex: 2, yIndex: 5 },
    { id: "KUN", xIndex: 3, yIndex: 5 },
    { id: "W", xIndex: 0, yIndex: 6 },
    { id: "WWN", xIndex: 1, yIndex: 6 },
    { id: "WUU", xIndex: 2, yIndex: 6 },
    { id: "WUN", xIndex: 3, yIndex: 6 },
    { id: "T", xIndex: 0, yIndex: 7 },
    { id: "P", xIndex: 4, yIndex: 1 }
];
// Create a map of TileType to frame index
const spriteIndices = new Map(spriteData.map(({ id, xIndex, yIndex }) => [id, yIndex * rowNumber + xIndex]));
export class SpriteLoader {
    tileSize = 28;
    preloadSprites(scene) {
        scene.load.spritesheet('spritesheet', spriteSheetUrl, {
            frameWidth: this.tileSize,
            frameHeight: this.tileSize,
            margin: 0,
            spacing: 1,
        });
    }
    getSpriteFrameById(id) {
        return spriteIndices.get(TileType[id]);
    }
    getSpriteFrameByName(name) {
        return spriteIndices.get(name);
    }
}
