import { Tile, TileType } from './Tile.js';
import { SpriteLoader } from "./SpriteLoader.js";
export class GridEditor extends Phaser.Scene {
    spriteLoader;
    currentLine = null;
    tileSize = 28;
    gridTileSize = { width: 200, height: 200 };
    isDragging = false;
    dragPosition = new Phaser.Math.Vector2();
    worldBounds;
    constructor() {
        super({ key: 'GridEditor' });
        this.spriteLoader = new SpriteLoader();
        this.worldBounds = {
            x: this.gridTileSize.width * this.tileSize,
            y: this.gridTileSize.height * this.tileSize
        };
    }
    preload() {
        this.spriteLoader.preloadSprites(this);
    }
    create() {
        this.input.on('pointerdown', this.handleMouseDown, this);
        this.input.on('pointermove', this.handleMouseMove, this);
        this.input.on('pointerup', this.handleMouseUp, this);
        this.input.on('wheel', this.handleMouseWheel, this);
        this.add.grid(0, 0, this.gridTileSize.width * this.tileSize, this.gridTileSize.height * this.tileSize, this.tileSize, this.tileSize, 0x1a1a1a);
    }
    handleMouseDown(pointer) {
        if (pointer.middleButtonDown()) {
            this.isDragging = true;
            this.dragPosition.set(pointer.x, pointer.y);
        }
        else if (pointer.leftButtonDown()) {
            this.createTileAt(pointer.worldX, pointer.worldY, TileType.G);
        }
    }
    handleMouseMove(pointer) {
        if (this.isDragging) {
            const deltaX = pointer.x - this.dragPosition.x;
            const deltaY = pointer.y - this.dragPosition.y;
            let newScrollX = this.cameras.main.scrollX - deltaX;
            let newScrollY = this.cameras.main.scrollY - deltaY;
            const maxScrollX = this.worldBounds.x - this.cameras.main.width / this.cameras.main.zoom;
            const maxScrollY = this.worldBounds.y - this.cameras.main.height / this.cameras.main.zoom;
            newScrollX = Phaser.Math.Clamp(newScrollX, 0, maxScrollX);
            newScrollY = Phaser.Math.Clamp(newScrollY, 0, maxScrollY);
            this.cameras.main.setScroll(newScrollX, newScrollY);
            this.dragPosition.set(pointer.x, pointer.y);
        }
        else if (pointer.isDown) {
            this.createTileAt(pointer.x, pointer.y, TileType.G);
        }
    }
    handleMouseUp(pointer) {
        if (pointer.middleButtonReleased()) {
            this.isDragging = false;
        }
        this.currentLine = null;
    }
    handleMouseWheel(pointer, gameObjects, deltaX, deltaY, deltaZ) {
        let newZoom = this.cameras.main.zoom - deltaY * 0.001; // change this to smaller value for smoother zoom
        newZoom = Phaser.Math.Clamp(newZoom, 0.3, 1.3);
        this.tweens.add({
            targets: this.cameras.main,
            zoom: newZoom,
            duration: 200,
            ease: 'Linear' // adjust for style of zoom
        });
    }
    createTileAt(clientX, clientY, tileType) {
        const { x, y } = this.cameras.main.getWorldPoint(clientX, clientY);
        const gridX = Math.floor(x / this.tileSize);
        const gridY = Math.floor(y / this.tileSize);
        if (gridX >= 0 && gridX < this.gridTileSize.width && gridY >= 0 && gridY < this.gridTileSize.height) {
            const tile = new Tile(tileType, { x: gridX, y: gridY });
            this.createTileSprite(tile);
        }
    }
    createTileSprite(tile) {
        const spriteKey = this.spriteLoader.getSpriteKey(tile.type);
        if (spriteKey) {
            const sprite = this.add.image(tile.location.x * this.tileSize, tile.location.y * this.tileSize, spriteKey).setOrigin(0, 0).setDepth(1);
        }
    }
}
