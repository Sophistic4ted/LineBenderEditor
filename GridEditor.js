export class GridEditor {
    canvas;
    context;
    tileSize;
    gridWidth;
    gridHeight;
    spriteLoader;
    tileSelector;
    constructor(spriteLoader, tileSelector, tileSize, gridWidth, gridHeight) {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        this.spriteLoader = spriteLoader;
        this.tileSelector = tileSelector;
        this.tileSize = tileSize;
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.canvas.width = this.tileSize * this.gridWidth;
        this.canvas.height = this.tileSize * this.gridHeight;
        this.canvas.addEventListener('click', this.onCanvasClick.bind(this));
        // Add the canvas to the document
        document.getElementById('canvas-container')?.appendChild(this.canvas);
        this.drawGrid();
    }
    drawGrid() {
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                this.context.strokeRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
            }
        }
    }
    onCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const gridX = Math.floor(x / this.tileSize);
        const gridY = Math.floor(y / this.tileSize);
        // draw the selected tile at the clicked position
        const sprite = this.spriteLoader.getSprite(this.tileSelector.getSelectedTile());
        if (sprite) {
            this.context.drawImage(sprite, gridX * this.tileSize, gridY * this.tileSize, this.tileSize, this.tileSize);
        }
    }
}
