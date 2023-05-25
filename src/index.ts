import { TileSelector } from "./TileSelector.js";
import { GridEditor } from "./GridEditor.js";
import { TileType } from "./Tile.js";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'canvas-container',
  scale: {
    mode: Phaser.Scale.RESIZE, // scales the game to fit the parent div
    autoCenter: Phaser.Scale.CENTER_BOTH, // centers the game within the div
  },
  scene: [GridEditor],
};

const game = new Phaser.Game(config);
game.scene.start('GridEditor');