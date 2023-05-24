export class TileSelector {
    spriteLoader;
    selectedTile;
    tileTypes;
    constructor(spriteLoader, tileTypes) {
        this.spriteLoader = spriteLoader;
        this.tileTypes = tileTypes;
        this.selectedTile = this.tileTypes[0]; // Select the first tile type by default
        this.buildUI();
    }
    buildUI() {
        const selectorDiv = document.getElementById('tile-selector');
        this.tileTypes.forEach(tileType => {
            const tileImage = this.spriteLoader.getSprite(tileType);
            if (!tileImage) {
                console.error(`No sprite found for tile type '${tileType}'`);
                return;
            }
            const tileButton = document.createElement('button');
            tileButton.style.backgroundImage = `url(${tileImage.src})`;
            tileButton.onclick = () => this.selectTile(tileType);
            selectorDiv.appendChild(tileButton);
        });
    }
    selectTile(tileType) {
        this.selectedTile = tileType;
        console.log(`Selected tile type: ${this.selectedTile}`);
        // TODO: Update the UI to indicate the selected tile
    }
    getSelectedTile() {
        return this.selectedTile;
    }
}
