import { TileType } from "./Tile.js";
export class TileSelector {
    spriteLoader;
    selectedTile;
    tileTypes;
    menuWidth;
    constructor(scene, spriteLoader, menuWidth) {
        this.spriteLoader = spriteLoader;
        this.tileTypes = spriteLoader.getTileTypes();
        this.selectedTile = this.tileTypes[0]; // Select the first tile type by default
        this.menuWidth = menuWidth;
        this.buildUI(scene);
    }
    buildUI(scene) {
        let xPosition = this.menuWidth / 4; // starting position of the tile selector
        let yPosition = 10; // starting y position
        let count = 0;
        // Create the menu background
        const background = scene.add.rectangle(0, 0, this.menuWidth, scene.cameras.main.height, 0x888888);
        background.setOrigin(0, 0);
        background.setDepth(-1); // make sure the background is behind everything else
        this.tileTypes.forEach(tileType => {
            const spriteKey = this.spriteLoader.getSpriteKey(tileType);
            if (!spriteKey) {
                console.error(`No sprite key found for tile type '${TileType[tileType]}'`);
                return;
            }
            const tileSprite = scene.add.sprite(xPosition, yPosition, spriteKey);
            tileSprite.setInteractive();
            tileSprite.on('pointerdown', () => this.selectTile(tileType));
            tileSprite.setDisplaySize(this.menuWidth / 3, this.menuWidth / 3); // Make the sprite fill 1/3 of the menu width
            tileSprite.setOrigin(0.5, 0); // Make the sprite anchor at the top-middle
            // Rest of the code...
            // Adjust the position for the next sprite
            count++;
            if (count % 3 === 0) {
                // If we have reached the third sprite, go to the next row
                xPosition = this.menuWidth / 4;
                yPosition += tileSprite.height + 10; // 10 is the space between sprites
            }
            else {
                xPosition += tileSprite.width + 10; // 10 is the space between sprites
            }
        });
    }
    selectTile(tileType) {
        this.selectedTile = tileType;
        console.log(`Selected tile type: ${TileType[this.selectedTile]}`);
    }
    getSelectedTile() {
        return this.selectedTile;
    }
}
