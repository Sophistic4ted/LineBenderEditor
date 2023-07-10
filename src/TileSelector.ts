import { SpriteLoader } from "./SpriteLoader.js";
import { TileType } from "./Tile.js";
import eventsCenter from "./EventsCenter.js";

export class TileSelector extends Phaser.Scene {
  private spriteLoader: SpriteLoader;
  private selectedTile: TileType | undefined = undefined;
  private tileTypes: TileType[];
  private menuWidth: number = 0;
  private tileData: Map<TileType, { frame: Phaser.GameObjects.Graphics, shadow: Phaser.GameObjects.Sprite, sprite: Phaser.GameObjects.Sprite }> = new Map();
  private spriteScale: number = 0.0;
  constructor() {
    super({ key: 'TileSelector' });
    this.spriteLoader = new SpriteLoader();
    this.tileTypes = [
      TileType.Grass,
      TileType.Bricks,
      TileType.Win,
      TileType.Swamp,
      TileType.Key,
      TileType.Door,
      TileType.Hydro,
      TileType.Fire,
      TileType.LevelSwitch,
      TileType.Portal1,
      TileType.Portal2,
      TileType.Portal3,
      TileType.Trash,
      TileType.Copy,
      TileType.Paste,
      TileType.Bender
    ];
  }

  create() {
    this.menuWidth = 385;
    this.cameras.main.setViewport(0, 0, this.menuWidth, this.scale.height);
    this.cameras.main.setBackgroundColor('#888888');
    const padding = 30;  // Increased padding
    const spriteSize = (this.menuWidth - padding * 4) / 3;
    this.spriteScale = spriteSize / this.spriteLoader.tileSize;
    let graphics = this.add.graphics({ lineStyle: { width: 20, color: 0xc9c5c5 } });

    // Draw a rounded rectangle around the menu
    graphics.strokeRoundedRect(0, 0, this.menuWidth, this.scale.height, 20);

    let yPosition = padding; // starting y position
    let xPosition = padding; // starting x position
    let countX = 0; // count of sprites in the current row

    this.tileTypes.forEach((tileType, index) => {
      const spriteFrame = this.spriteLoader.getSpriteFrameByTileType(tileType);

      // Create a shadow sprite with a dark tint and an offset
      let shadow = this.add.sprite(xPosition + 3 + spriteSize / 2, yPosition + 3 + spriteSize / 2, 'spritesheet', spriteFrame)
        .setOrigin(0.5, 0.5)  // Change origin to the center
        .setScale(this.spriteScale)
        .setTint(0x000000)
        .setAlpha(0.5);

      let sprite = this.add.sprite(xPosition, yPosition, 'spritesheet', spriteFrame)
        .setOrigin(0.5, 0.5)  // Change origin to the center
        .setPosition(xPosition + spriteSize / 2, yPosition + spriteSize / 2)
        .setScale(this.spriteScale)
        .setInteractive();

      // Create a frame for each sprite
      let frame = this.add.graphics();
      const frameSize = spriteSize;
      frame.lineStyle(2, 0xffffff);
      frame.strokeRect(sprite.x - frameSize / 2, sprite.y - frameSize / 2, frameSize, frameSize);
      frame.alpha = (tileType == this.selectedTile) ? 1 : 0;

      this.tileData.set(tileType, { frame, shadow, sprite })
      sprite.on('pointerdown', () => {
        this.selectTile(tileType);
      });

      sprite.on('pointerover', () => {
        sprite.setTint(0xc9c5c5); // change the sprite's tint when the mouse pointer is over it
      });

      sprite.on('pointerout', () => {
        sprite.clearTint(); // remove the tint when the mouse pointer leaves the sprite
      });

      countX++;
      if (countX >= 3) {
        countX = 0;
        yPosition += spriteSize + padding; // Move to the next row
        xPosition = padding; // Reset the x position
      } else {
        xPosition += spriteSize + padding; // Move to the next column
      }
    });
  }

  public selectTile(tileType: TileType) {
    if (this.selectedTile != undefined) {
      // Hide previous selection frame
      let previousTileData = this.tileData.get(this.selectedTile);
      if (previousTileData?.frame) previousTileData.frame.alpha = 0;
      previousTileData?.sprite.setScale(this.spriteScale);
      previousTileData?.shadow.setScale(this.spriteScale);
    }
    this.selectedTile = tileType;

    let selectedTileData = this.tileData.get(this.selectedTile);
    // Show the frame of the selected sprite
    if (selectedTileData?.frame) selectedTileData.frame.alpha = 1;

    selectedTileData?.sprite.setScale(this.spriteScale * 0.95); // Reduce the size of the sprite when it is selected
    selectedTileData?.shadow.setScale(0);
    eventsCenter.emit('use-tool', this.selectedTile)
  }

  getSelectedTile(): TileType | undefined {
    return this.selectedTile;
  }
}