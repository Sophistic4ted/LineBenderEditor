import { GridEditor } from "./GridEditor.js";
const config = {
    type: Phaser.AUTO,
    parent: 'canvas-container',
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH, // centers the game within the div
    },
    scene: [GridEditor],
};
const game = new Phaser.Game(config);
game.scene.start('GridEditor');
