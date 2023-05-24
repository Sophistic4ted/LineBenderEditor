import { SpriteLoader } from "./SpriteLoader.js"
import { TileSelector } from "./TileSelector.js"

export class GridEditor {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private tileSize: number;
    private gridWidth: number;
    private gridHeight: number;
    private spriteLoader: SpriteLoader;
    private tileSelector: TileSelector;
  
    constructor(spriteLoader: SpriteLoader, tileSelector: TileSelector, tileSize: number, gridWidth: number, gridHeight: number) {
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d')!;
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
  
    private drawGrid() {
      for (let x = 0; x < this.gridWidth; x++) {
        for (let y = 0; y < this.gridHeight; y++) {
          this.context.strokeRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
        }
      }
    }
  
    private onCanvasClick(event: MouseEvent) {
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
  