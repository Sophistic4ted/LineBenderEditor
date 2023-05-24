import { SpriteLoader } from "./SpriteLoader.js";
import { TileSelector } from "./TileSelector.js";

interface Line {
  tiles: Tile[];
}

interface Tile {
  x: number;
  y: number;
  tile: string;
  neighbors: string[][];
}

export class GridEditor {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private tileSize: number;
  private gridWidth: number;
  private gridHeight: number;
  private spriteLoader: SpriteLoader;
  private tileSelector: TileSelector;
  private isDrawing: boolean;
  private lines: Line[];
  private currentLine: Line | null;

  constructor(spriteLoader: SpriteLoader, tileSelector: TileSelector, tileSize: number, gridWidth: number, gridHeight: number) {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d')!;
    this.spriteLoader = spriteLoader;
    this.tileSelector = tileSelector;
    this.tileSize = tileSize;
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.isDrawing = false;
    this.lines = [];
    this.currentLine = null;

    this.canvas.width = this.tileSize * this.gridWidth;
    this.canvas.height = this.tileSize * this.gridHeight;

    this.canvas.addEventListener('mousedown', this.onCanvasMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onCanvasMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onCanvasMouseUp.bind(this));

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

  private onCanvasMouseDown(event: MouseEvent) {
    this.isDrawing = true;
    this.currentLine = {
      tiles: [],
    };
    this.updateLineTiles(event);
  }

  private onCanvasMouseMove(event: MouseEvent) {
    if (this.isDrawing) {
      this.updateLineTiles(event);
    }
  }

  private onCanvasMouseUp() {
    this.isDrawing = false;
    if (this.currentLine && this.currentLine.tiles.length > 0) {
      this.lines.push(this.currentLine);
    }
    this.currentLine = null;
  }

  private updateLineTiles(event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
  
    const gridX = Math.floor(x / this.tileSize);
    const gridY = Math.floor(y / this.tileSize);
  
    const sprite = this.spriteLoader.getSprite(this.tileSelector.getSelectedTile());
    if (sprite) {
      this.context.drawImage(sprite, gridX * this.tileSize, gridY * this.tileSize, this.tileSize, this.tileSize);
    }
  
    const tile: Tile = {
      x: gridX,
      y: gridY,
      tile: this.tileSelector.getSelectedTile(),
      neighbors: [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
      ],
    };
  
    if (this.currentLine) {
      if (this.currentLine.tiles.length > 0) {
        const lastTile = this.currentLine.tiles[this.currentLine.tiles.length - 1];
        const dx = gridX - lastTile.x;
        const dy = gridY - lastTile.y;
  
        if (dx !== 0 || dy !== 0) {
          const xStep = dx !== 0 ? dx / Math.abs(dx) : 0;
          const yStep = dy !== 0 ? dy / Math.abs(dy) : 0;
          let currentX = lastTile.x;
          let currentY = lastTile.y;
  
          while (currentX !== gridX || currentY !== gridY) {
            currentX += xStep;
            currentY += yStep;
            const intermediateTile = { ...tile, x: currentX, y: currentY }; // Copy the current tile, but with updated x, y
            this.updateTileNeighbors(lastTile, intermediateTile);
            this.currentLine.tiles.push(intermediateTile);
          }
        }
  
        this.updateTileNeighbors(lastTile, tile);
      }
  
      this.currentLine.tiles.push(tile);
    }
  }
  
  private updateTileNeighbors(lastTile: Tile, tile: Tile) {
    const dx = tile.x - lastTile.x;
    const dy = tile.y - lastTile.y;
  
    // Update neighbor information
    if (dx === 0) {
      // Vertical movement
      if (dy > 0) {
        // Downward movement
        lastTile.neighbors[2][1] = tile.tile;
        tile.neighbors[0][1] = lastTile.tile;
      } else {
        // Upward movement
        lastTile.neighbors[0][1] = tile.tile;
        tile.neighbors[2][1] = lastTile.tile;
      }
    } else if (dy === 0) {
      // Horizontal movement
      if (dx > 0) {
        // Rightward movement
        lastTile.neighbors[1][2] = tile.tile;
        tile.neighbors[1][0] = lastTile.tile;
      } else {
        // Leftward movement
        lastTile.neighbors[1][0] = tile.tile;
        tile.neighbors[1][2] = lastTile.tile;
      }
    }
  }
  
  
}
