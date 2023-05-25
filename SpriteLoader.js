import { TileType } from "./Tile.js";
const spriteSheetUrl = "sprites_2.png";
const tileSize = 28;
const spriteData = [
    { id: TileType.G, xIndex: 0, yIndex: 0 },
    { id: TileType.B, xIndex: 0, yIndex: 1 },
    { id: TileType.S, xIndex: 0, yIndex: 2 },
    { id: TileType.D, xIndex: 0, yIndex: 4 },
    { id: TileType.K, xIndex: 0, yIndex: 5 },
    { id: TileType.W, xIndex: 0, yIndex: 6 }
    // Add more tile types as needed
];
// keep track of the sprite keys
const spriteKeys = {
    [TileType.G]: 'G_key',
    [TileType.B]: 'B_key',
    [TileType.S]: 'S_key',
    [TileType.D]: 'D_key',
    [TileType.K]: 'K_key',
    [TileType.W]: 'W_key',
    // add more as needed
};
export class SpriteLoader {
    sprites; // will map TileType to sprite key
    constructor() {
        this.sprites = new Map();
    }
    preloadSprites(scene) {
        const spritesPerRow = 7; // Replace this with the actual number of sprites per row
        spriteData.forEach(({ id, xIndex, yIndex }) => {
            const spriteKey = spriteKeys[id];
            const frameIndex = yIndex * spritesPerRow + xIndex;
            scene.load.spritesheet(spriteKey, spriteSheetUrl, {
                frameWidth: tileSize,
                frameHeight: tileSize,
                startFrame: frameIndex,
                endFrame: frameIndex
            });
            this.sprites.set(id, spriteKey);
        });
    }
    getSpriteKey(id) {
        return this.sprites.get(id);
    }
    getTileTypes() {
        return spriteData.map(data => data.id);
    }
}
