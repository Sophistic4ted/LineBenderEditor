export class SpriteLoader {
    private spriteSheet: HTMLImageElement;
    private sprites: Map<string, HTMLImageElement>;
  
    constructor(private spriteSheetUrl: string, private tileSize: number) {
      this.spriteSheet = new Image();
      this.sprites = new Map();
    }
  
    loadSprites(spriteData: { id: string; xIndex: number; yIndex: number }[]): Promise<void> {
      return new Promise<void>((resolve, reject) => {
        this.spriteSheet.onload = () => {
          // Create a hidden canvas to draw and extract each sprite
          const canvas = document.createElement('canvas');
          canvas.width = this.tileSize;
          canvas.height = this.tileSize;
          const ctx = canvas.getContext('2d');
  
          spriteData.forEach(({ id, xIndex, yIndex }) => {
            // Draw the sprite onto the canvas
            if (ctx) {
              ctx.drawImage(
                this.spriteSheet,
                xIndex * this.tileSize, yIndex * this.tileSize, this.tileSize, this.tileSize, 
                0, 0, this.tileSize, this.tileSize
              );
  
              // Create a new image from the canvas and store it in the map
              const img = new Image();
              img.src = canvas.toDataURL();
              this.sprites.set(id, img);
  
              // Clear the canvas for the next sprite
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
          });
  
          resolve();
        };
  
        this.spriteSheet.onerror = reject;
        this.spriteSheet.src = this.spriteSheetUrl;
      });
    }
  
    getSprite(id: string): HTMLImageElement | undefined {
      return this.sprites.get(id);
    }

    getSpriteMap(): Map<string, HTMLImageElement> {
        return this.sprites;
    }
  }
  