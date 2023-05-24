export class SpriteSelector {
    tileSelector;
    tileSize;
    spriteSheet;
    tilesData;
    constructor(tileSelectorId, spriteSheetUrl, tileSize, tilesData) {
        this.tileSelector = document.getElementById(tileSelectorId);
        this.spriteSheet = new Image();
        this.spriteSheet.src = spriteSheetUrl;
        this.tileSize = tileSize;
        this.tilesData = tilesData;
        this.spriteSheet.onload = () => {
            this.populateSpriteSelector();
        };
    }
    populateSpriteSelector() {
        this.tilesData.forEach((tileData) => {
            const canvas = document.createElement('canvas');
            canvas.width = this.tileSize;
            canvas.height = this.tileSize;
            const x = tileData.x * this.tileSize;
            const y = tileData.y * this.tileSize;
            const ctx = canvas.getContext('2d');
            if (ctx !== null) {
                ctx.drawImage(this.spriteSheet, x, y, this.tileSize, this.tileSize, 0, 0, this.tileSize, this.tileSize);
            }
            const img = document.createElement('img');
            img.src = canvas.toDataURL();
            const tileDiv = document.createElement('div');
            tileDiv.classList.add('tile');
            tileDiv.dataset.type = tileData.type;
            tileDiv.appendChild(img);
            tileDiv.addEventListener('click', (event) => {
                const selectedTileType = tileDiv.getAttribute('data-type');
                console.log(selectedTileType);
            });
            this.tileSelector.appendChild(tileDiv);
        });
    }
}
export default SpriteSelector;
