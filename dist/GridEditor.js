import { SpriteLoader } from "./SpriteLoader.js";
import eventsCenter from "./EventsCenter.js";
import { TileType, Tile, Direction } from "./Tile.js";
import { ToolHandler } from "./ToolHandler.js";
export class GridEditor extends Phaser.Scene {
    tileSize = 28;
    menuWidth = 385;
    gridTileSize = { width: 100, height: 100 };
    isDragging = false;
    isDrawing = false;
    dragPosition = new Phaser.Math.Vector2();
    worldBounds;
    spriteLoader;
    tiles = [];
    toolHandler;
    lineCounter = 0;
    tempLine = undefined;
    lines = [];
    incrementLines = true;
    addToBeginning = false;
    lineHues = [];
    constructor() {
        super({ key: 'GridEditor' });
        this.worldBounds = {
            x: this.gridTileSize.width * this.tileSize,
            y: this.gridTileSize.height * this.tileSize
        };
        this.spriteLoader = new SpriteLoader();
        this.toolHandler = new ToolHandler(this);
    }
    preload() {
        this.initTileMap();
        this.spriteLoader.preloadSprites(this);
    }
    create() {
        this.input.on('pointerdown', this.handleMouseDown, this);
        this.input.on('pointermove', this.handleMouseMove, this);
        this.input.on('pointerup', this.handleMouseUp, this);
        this.input.on('wheel', this.handleMouseWheel, this);
        this.input.on('pointerdown', this.toolHandler.handlePointerDown.bind(this.toolHandler));
        this.input.on('pointermove', this.toolHandler.handlePointerMove.bind(this.toolHandler));
        this.input.on('pointerup', this.toolHandler.handlePointerUp.bind(this.toolHandler));
        this.scale.on('resize', this.handleResize, this);
        this.input.keyboard?.on('keydown-C', async () => {
            const textToCopy = 'Hello, world!';
            try {
                await navigator.clipboard.writeText(textToCopy);
                console.log('Text copied to clipboard');
            }
            catch (err) {
                console.error('Error in copying text: ', err);
            }
        });
        eventsCenter.on('update-tool', this.updateTool, this);
        this.add.grid(0, 0, this.worldBounds.x, this.worldBounds.y, this.tileSize, this.tileSize, 0x1a1a1a).setOrigin(0); // Set grid's origin to the top-left corner
        this.cameras.main.setViewport(this.menuWidth, 0, this.scale.width - this.menuWidth, this.scale.height);
        // Set camera bounds
        this.cameras.main.setBounds(0, 0, this.worldBounds.x, this.worldBounds.y);
        // Center the camera
        this.cameras.main.centerOn(this.worldBounds.x / 2, this.worldBounds.y / 2);
        this.cameras.main.setZoom(2);
    }
    initTileMap() {
        for (let y = 0; y < this.gridTileSize.height; y++) {
            let row = [];
            for (let x = 0; x < this.gridTileSize.width; x++) {
                let tile = new Tile(TileType.None, { x: x, y: y });
                tile.setSprite(undefined);
                tile.setLine(undefined);
                row.push(tile);
            }
            this.tiles.push(row);
        }
    }
    updateTool(tool) {
        this.toolHandler.setTool(tool);
    }
    placeAt(x, y, type, isStart = false) {
        if (this.tiles[y][x].sprite === undefined) {
            this.processEmptyField(x, y, type);
        }
        else {
            this.processOccupiedField(y, x, type, isStart);
        }
        console.log(this.lines);
    }
    isCorrectMovement(x, y) {
        const line = this.tiles[y][x].getLine();
        if (!this.isWithinBounds(x, y)) {
            return false;
        }
        if (line !== undefined) {
            if (this.lines[line]?.length > 1) {
                const lastTile = this.lines[line][this.lines[line].length - 2];
                if (this.getDirection(lastTile.location, { x: x, y: y }) === undefined) {
                    return false;
                }
                if (!this.checkContinuity(lastTile.location, { x: x, y: y })) {
                    return false;
                }
            }
        }
        return true;
    }
    checkContinuity(from, to) {
        if (Math.abs(to.x - from.x) <= 1 && Math.abs(to.y - from.y) <= 1) {
            return true;
        }
        return false;
    }
    getDirection(from, to) {
        if (from.x === to.x) {
            return from.y < to.y ? Direction.South : Direction.North;
        }
        else if (from.y === to.y) {
            return from.x < to.x ? Direction.East : Direction.West;
        }
        else {
            return undefined;
        }
    }
    getSpriteData(tileType, previousDirection, nextDirection) {
        let tileTypeString = TileType[tileType];
        const directionMap = {
            [`${Direction.West}${Direction.North}`]: { name: `${tileTypeString}WN`, rotation: 0 },
            [`${Direction.North}${Direction.East}`]: { name: `${tileTypeString}WN`, rotation: 90 },
            [`${Direction.East}${Direction.South}`]: { name: `${tileTypeString}WN`, rotation: 180 },
            [`${Direction.South}${Direction.West}`]: { name: `${tileTypeString}WN`, rotation: 270 },
            [`${Direction.East}${Direction.West}`]: { name: `${tileTypeString}`, rotation: 0 },
            [`${Direction.South}${Direction.North}`]: { name: `${tileTypeString}`, rotation: 90 },
            [`undefined${Direction.East}`]: { name: `${tileTypeString}UN`, rotation: 180 },
            [`undefined${Direction.South}`]: { name: `${tileTypeString}UN`, rotation: 270 },
            [`undefined${Direction.West}`]: { name: `${tileTypeString}UN`, rotation: 0 },
            [`undefined${Direction.North}`]: { name: `${tileTypeString}UN`, rotation: 90 },
            [`undefinedundefined`]: { name: `${tileTypeString}UU`, rotation: 0 },
        };
        let value = undefined;
        if (directionMap[`${previousDirection}${nextDirection}`]) {
            value = directionMap[`${previousDirection}${nextDirection}`];
        }
        else if (directionMap[`${nextDirection}${previousDirection}`]) {
            value = directionMap[`${nextDirection}${previousDirection}`];
        }
        else {
            throw new Error(`Invalid combination of directions: ${previousDirection}, ${nextDirection}`);
        }
        value.rotation = value.rotation * (Math.PI / 180);
        return value;
    }
    oppositeDirection(direction) {
        switch (direction) {
            case Direction.North:
                return Direction.South;
            case Direction.South:
                return Direction.North;
            case Direction.East:
                return Direction.West;
            case Direction.West:
                return Direction.East;
        }
    }
    processOccupiedField(y, x, type, isStart = false) {
        const tile = this.tiles[y][x];
        if (tile !== undefined) {
            if (tile.type !== type) {
                this.processFieldWithDifferentSprite(y, x, type);
            }
            if (isStart && (tile.previousTileDirection === undefined || tile.nextTileDirection === undefined) && this.isDrawing && this.tempLine === undefined) {
                this.incrementLines = false;
                this.tempLine = tile.getLine();
                if (tile.previousTileDirection === undefined) {
                    this.addToBeginning = true;
                }
            }
            if (tile.getLine() !== undefined) {
                if (!isStart && this.lineCounter !== tile.getLine()) {
                    this.isDrawing = false;
                }
            }
        }
    }
    processFieldWithDifferentSprite(y, x, type) {
        this.incrementLines = false;
        this.tiles[y][x].sprite?.destroy(); // remove sprite from scene
        this.tiles[y][x].sprite = undefined; // remove sprite reference
        const spriteFrame = this.spriteLoader.getSpriteFrameById(type);
        const sprite = this.createSprite(x, y, type);
    }
    isWithinBounds(x, y) {
        return x >= 0 && y >= 0 && x < this.gridTileSize.width && y < this.gridTileSize.height;
    }
    getSpriteFrame(type) {
        const spriteFrame = this.spriteLoader.getSpriteFrameByName(type);
        if (spriteFrame === undefined) {
            console.error("Attempted to place tile with an unregistered sprite");
        }
        return spriteFrame;
    }
    processEmptyField(x, y, type) {
        if (this.isDrawing) {
            const line = this.tempLine !== undefined ? this.tempLine : this.lineCounter;
            this.tiles[y][x].setLine(line);
            // if(!this.isCorrectMovement(x, y)) {
            //   this.tiles[y][x].setLine(undefined);
            //   return
            // }
            while (this.lines[line] === undefined) {
                this.lines.push([]);
            }
            if (this.addToBeginning) {
                this.lines[line].unshift(this.tiles[y][x]);
            }
            else {
                this.lines[line].push(this.tiles[y][x]);
            }
            this.updateNeighbours(x, y);
            this.createSprite(x, y, type);
        }
    }
    updateNeighbours(x, y) {
        const line = this.tiles[y][x].getLine();
        if (line !== undefined && this.lines[line].length > 1) {
            if (!this.addToBeginning) {
                const lastTile = this.lines[line][this.lines[line].length - 2];
                const nextTile = this.lines[line][this.lines[line].length - 1];
                const direction = this.getDirection(lastTile.location, { x: x, y: y });
                if (direction) {
                    lastTile.setNextTileDirection(direction);
                    this.updateSprite(lastTile);
                    this.tiles[y][x].setPreviousTileDirection(this.oppositeDirection(direction));
                }
            }
            if (this.addToBeginning) {
                const nextTile = this.lines[line][1];
                const direction = this.getDirection({ x: x, y: y }, nextTile.location);
                if (direction) {
                    nextTile.setPreviousTileDirection(this.oppositeDirection(direction));
                    this.updateSprite(nextTile);
                    this.tiles[y][x].setNextTileDirection(direction);
                }
            }
        }
    }
    updateSprite(tile) {
        if (tile !== undefined) {
            const previousDirection = tile.getPreviousTileDirection();
            const nextDirection = tile.getNextTileDirection();
            const { name: spriteName, rotation } = this.getSpriteData(tile.getType(), previousDirection, nextDirection);
            const spriteFrame = this.spriteLoader.getSpriteFrameByName(spriteName);
            if (spriteFrame !== undefined) {
                tile.sprite?.setFrame(spriteFrame).setRotation(rotation);
            }
        }
    }
    createSprite(x, y, type) {
        // Finally, we create the sprite and set its rotation.
        const previousDirection = this.tiles[y][x].getPreviousTileDirection();
        const nextDirection = this.tiles[y][x].getNextTileDirection();
        const { name: spriteName, rotation } = this.getSpriteData(type, previousDirection, nextDirection);
        const spriteFrame = this.getSpriteFrame(spriteName);
        const lineNumber = this.tiles[y][x].getLine();
        const sprite = this.add.sprite(x * this.tileSize + this.tileSize / 2, y * this.tileSize + this.tileSize / 2, 'spritesheet', spriteFrame).setRotation(rotation).setOrigin(0.5);
        this.tiles[y][x].setType(type);
        this.tiles[y][x].sprite = sprite;
    }
    removeAt(x, y) {
        if (!this.isWithinBounds(x, y)) {
            console.error("Attempted to remove tile out of grid bounds");
            return;
        }
        const tile = this.tiles[y][x];
        const lineIndex = tile.getLine();
        // If the tile is already removed, just return
        if (tile.getType() === TileType.None || lineIndex === undefined) {
            return;
        }
        const tileIndex = this.lines[lineIndex].indexOf(tile);
        // If the tile is not found in the line, return
        if (tileIndex === -1) {
            return;
        }
        this.lines[lineIndex].splice(tileIndex, 1);
        tile.setType(TileType.None);
        tile.setNextTileDirection(undefined);
        tile.setPreviousTileDirection(undefined);
        tile.sprite?.destroy(); // remove sprite from scene
        tile.sprite = undefined; // remove sprite reference
        this.updateSprite(tile);
        // If the line has no more tiles
        if (this.lines[lineIndex].length === 0) {
            // Remove the line itself
            this.lines.splice(lineIndex, 1);
            // Decrement the lineCounter
            this.lineCounter--;
            // Update line indices for remaining lines
            for (let i = lineIndex; i < this.lines.length; i++) {
                this.lines[i].forEach(tile => tile.line = i);
            }
        }
        else if (tileIndex <= this.lines[lineIndex]?.length) {
            let nextTile = this.lines[lineIndex][tileIndex];
            let previousTile = this.lines[lineIndex][tileIndex - 1];
            nextTile?.setPreviousTileDirection(undefined);
            previousTile?.setNextTileDirection(undefined);
            this.updateSprite(nextTile);
            this.updateSprite(previousTile);
            this.lineCounter++;
            const newLine = this.lines[lineIndex].splice(tileIndex);
            this.lines.push(newLine);
            newLine.forEach(tile => tile.line = this.lines.length - 1);
        }
    }
    handleMouseDown(pointer) {
        const camera = this.cameras.main;
        if (pointer.middleButtonDown() &&
            pointer.x > camera.x && pointer.x < camera.x + camera.width &&
            pointer.y > camera.y && pointer.y < camera.y + camera.height) {
            this.isDragging = true;
            this.dragPosition.set(pointer.x, pointer.y);
        }
    }
    handleMouseMove(pointer) {
        if (pointer.middleButtonDown()) {
            const camera = this.cameras.main;
            if (pointer.x < camera.x || pointer.x > camera.x + camera.width ||
                pointer.y < camera.y || pointer.y > camera.y + camera.height) {
                this.isDragging = false;
            }
            else {
                if (this.isDragging) {
                    const deltaX = this.dragPosition.x - pointer.x;
                    const deltaY = this.dragPosition.y - pointer.y;
                    this.cameras.main.scrollX += deltaX;
                    this.cameras.main.scrollY += deltaY;
                    this.dragPosition.set(pointer.x, pointer.y);
                }
            }
        }
    }
    handleMouseUp(pointer) {
        if (pointer.middleButtonReleased()) {
            this.isDragging = false;
        }
    }
    handleMouseWheel(pointer, gameObjects, deltaX, deltaY, deltaZ) {
        const camera = this.cameras.main;
        if (pointer.x < camera.x || pointer.x > camera.x + camera.width ||
            pointer.y < camera.y || pointer.y > camera.y + camera.height) {
            return;
        }
        let newZoom = this.cameras.main.zoom - deltaY * 0.001; // change this to smaller value for smoother zoom
        const maxZoomX = this.cameras.main.width / this.worldBounds.x;
        const maxZoomY = this.cameras.main.height / this.worldBounds.y;
        const maxZoom = Math.max(maxZoomX, maxZoomY);
        newZoom = Phaser.Math.Clamp(newZoom, maxZoom, 3);
        this.cameras.main.zoomTo(newZoom, 200); // Use zoomTo for smoother transition
    }
    handleResize(gameSize, baseSize, displaySize, resolution) {
        this.cameras.main.setViewport(this.menuWidth, 0, gameSize.width - this.menuWidth, gameSize.height); // ...
    }
}
