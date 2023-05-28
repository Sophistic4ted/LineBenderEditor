import { TileSelector } from "./TileSelector.js";
import { GridEditor } from "./GridEditor.js";
import { SpriteLoader } from "./SpriteLoader.js";
import { TileType } from "./Tile.js";

window.onload = () => {
  const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: {
          preload: function() {
            new SpriteLoader().preloadSprites(this);
          },
          create: function() {
              this.scene.add('TileSelector', TileSelector, true);
              this.scene.add('GridEditor', GridEditor, true);
          }
      },
  };

  const game = new Phaser.Game(config);
}
