import { SpriteLoader } from "./SpriteLoader.js";
import { TileSelector } from "./TileSelector.js";
import { GridEditor } from "./GridEditor.js"; // Assuming you've created a GridEditor.ts file
const spriteSheetUrl = "../res/sprites_2.png";
const tileSize = 28; // Use the size that matches your sprites
const gridWidth = 100; // Choose a grid size that suits your needs
const gridHeight = 100;
// Define the tile types and their positions in the sprite sheet
const spriteData = [
    { id: 'G', xIndex: 0, yIndex: 0 },
    { id: 'B', xIndex: 0, yIndex: 1 },
    { id: 'S', xIndex: 0, yIndex: 2 },
    { id: 'D', xIndex: 0, yIndex: 4 },
    { id: 'K', xIndex: 0, yIndex: 5 },
    { id: 'W', xIndex: 0, yIndex: 6 }
    // Add more tile types as needed
];
const spriteLoader = new SpriteLoader(spriteSheetUrl, tileSize);
spriteLoader.loadSprites(spriteData).then(() => {
    const tileTypes = spriteData.map(data => data.id);
    const tileSelector = new TileSelector(spriteLoader, tileTypes);
    // Create the grid editor
    const gridEditor = new GridEditor(spriteLoader, tileSelector, tileSize, gridWidth, gridHeight);
}).catch((error) => {
    console.error("Failed to load sprites:", error);
});
