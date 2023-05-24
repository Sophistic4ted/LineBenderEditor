import { TileSelector } from "./TileSelector.js";
import { SpriteLoader } from "./SpriteLoader.js";
// Load the sprites
const spriteLoader = new SpriteLoader('sprites_2.png', 28);
spriteLoader.loadSprites([
    { id: 'G', xIndex: 0, yIndex: 0 },
    { id: 'B', xIndex: 0, yIndex: 1 },
    { id: 'S', xIndex: 0, yIndex: 2 },
    { id: 'D', xIndex: 0, yIndex: 4 },
    { id: 'K', xIndex: 0, yIndex: 5 },
    { id: 'W', xIndex: 0, yIndex: 6 }
    // Add more sprite indices as needed...
]).then(() => {
    // Define the tile types
    const tileTypes = ['G', 'B', 'W', 'S', 'K', 'D'];
    // Load the sprites
    // Create a new TileSelector instance
    const tileSelector = new TileSelector(spriteLoader, tileTypes);
    // Now you can get the selected tile type whenever you need it
    console.log('Selected tile type:', tileSelector.getSelectedTile());
    // TODO: Use the selected tile type for drawing tiles, etc.
}).catch(error => {
    console.error('Failed to load sprites:', error);
});
